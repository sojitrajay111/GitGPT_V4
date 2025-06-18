const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = null;
  }

  // Initialize Google Drive API with credentials
  initialize(credentials) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.metadata.readonly'
        ]
      });

      this.drive = google.drive({ version: 'v3', auth });
      
      // Create or get the main folder for the application
      this.createOrGetMainFolder();
      
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
      return false;
    }
  }

  // Create or get the main folder for storing project documents
  async createOrGetMainFolder() {
    try {
      const folderName = 'GitGPT_Project_Documents';
      
      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
        return this.folderId;
      }

      // Create new folder if it doesn't exist
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [] // Root folder
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      this.folderId = folder.data.id;
      return this.folderId;
    } catch (error) {
      console.error('Error creating/getting main folder:', error);
      throw error;
    }
  }

  // Create project-specific folder
  async createProjectFolder(projectId, projectName) {
    try {
      const folderName = `Project_${projectName}_${projectId}`;
      
      // Search for existing project folder
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${this.folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new project folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId]
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      return folder.data.id;
    } catch (error) {
      console.error('Error creating project folder:', error);
      throw error;
    }
  }

  // Upload file to Google Drive
  async uploadFile(fileBuffer, fileName, mimeType, projectFolderId) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [projectFolderId],
        mimeType: mimeType
      };

      const media = {
        mimeType: mimeType,
        body: fileBuffer
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, size, webViewLink, webContentLink'
      });

      return {
        fileId: file.data.id,
        fileName: file.data.name,
        size: file.data.size,
        viewLink: file.data.webViewLink,
        downloadLink: file.data.webContentLink
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }

  // Update file in Google Drive
  async updateFile(fileId, fileBuffer, fileName, mimeType) {
    try {
      const media = {
        mimeType: mimeType,
        body: fileBuffer
      };

      const file = await this.drive.files.update({
        fileId: fileId,
        media: media,
        fields: 'id, name, size, webViewLink, webContentLink'
      });

      return {
        fileId: file.data.id,
        fileName: file.data.name,
        size: file.data.size,
        viewLink: file.data.webViewLink,
        downloadLink: file.data.webContentLink
      };
    } catch (error) {
      console.error('Error updating file in Google Drive:', error);
      throw error;
    }
  }

  // Get file info
  async getFileInfo(fileId) {
    try {
      const file = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, webViewLink, webContentLink, mimeType'
      });

      return {
        fileId: file.data.id,
        fileName: file.data.name,
        size: file.data.size,
        viewLink: file.data.webViewLink,
        downloadLink: file.data.webContentLink,
        mimeType: file.data.mimeType
      };
    } catch (error) {
      console.error('Error getting file info from Google Drive:', error);
      throw error;
    }
  }

  // Check if user has Google Drive access
  async checkAccess() {
    try {
      await this.drive.about.get({
        fields: 'user'
      });
      return true;
    } catch (error) {
      console.error('Error checking Google Drive access:', error);
      return false;
    }
  }
}

module.exports = new GoogleDriveService(); 