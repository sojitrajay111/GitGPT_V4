const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const stream = require('stream'); // Import the stream module

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.folderId = null;
  }

  // For service account or raw credentials (optional for your use case)
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
      this.createOrGetMainFolder();
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
      return false;
    }
  }

  // ✅ New method: Initialize with OAuth2 client (user-based)
  initializeWithOAuth2Client(oauth2Client) {
    try {
      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      return true;
    } catch (error) {
      console.error('Error initializing with OAuth2 client:', error);
      return false;
    }
  }

  async createOrGetMainFolder() {
    try {
      const folderName = 'GitGPT documents';
      // Search for the folder
      const res = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)',
      });

      if (res.data.files.length > 0) {
        this.folderId = res.data.files[0].id;
        console.log('Main folder already exists:', this.folderId);
      } else {
        // Create the folder if it doesn't exist
        const fileMetadata = {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await this.drive.files.create({
          resource: fileMetadata,
          fields: 'id',
        });
        this.folderId = folder.data.id;
        console.log('Main folder created:', this.folderId);
      }
      return this.folderId;
    } catch (error) {
      console.error('Error creating or getting main folder:', error);
      throw error;
    }
  }

  // Method to check Google Drive access (e.g., after initialization)
  async checkAccess() {
    try {
      // Try to list files (even just one) to check for access
      await this.drive.files.list({
        pageSize: 1,
        fields: 'files(id, name)',
      });
      return true;
    } catch (error) {
      console.error('Google Drive access check failed:', error.message);
      return false;
    }
  }

  // New method to upload a file (from buffer)
  async uploadFile(fileBuffer, fileName, mimeType) {
    try {
      // Create a readable stream from the buffer
      const bufferStream = new stream.Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null); // Indicates end of the stream

      const media = {
        mimeType: mimeType,
        body: bufferStream // Pass the stream here
      };

      const file = await this.drive.files.create({
        resource: {
          name: fileName,
          parents: [this.folderId]
        },
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

  async updateFile(fileId, fileBuffer, fileName, mimeType) {
    try {
      // Create a readable stream from the buffer
      const bufferStream = new stream.Readable();
      bufferStream.push(fileBuffer);
      bufferStream.push(null); // Indicates end of the stream

      const media = {
        mimeType: mimeType,
        body: bufferStream // Pass the stream here
      };

      const file = await this.drive.files.update({
        fileId,
        media,
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

  async getFileInfo(fileId) {
    try {
      const file = await this.drive.files.get({
        fileId,
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

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({ fileId });
      return { success: true, message: 'File deleted successfully.' };
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  }
}

module.exports = new GoogleDriveService();