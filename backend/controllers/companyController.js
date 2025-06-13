// server/controllers/companyController.js

const Company = require("../models/Company");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to generate a default logo URL from company name
const generateDefaultLogoUrl = (companyName) => {
  if (!companyName) return null;
  const firstLetter = companyName.charAt(0).toUpperCase();
  // This is a basic placeholder; in a real app, you might use a service
  // or generate a more sophisticated image programmatically via Cloudinary or similar.
  // For now, we'll use a placeholder image service.
  return `https://placehold.co/120x120/E0E7FF/4338CA?text=${firstLetter}`;
};

/**
 * @desc Add or Update Company Details
 * @route POST /api/company/add-or-update/:userId
 * @access Private (assuming authentication middleware provides userId)
 */
const addOrUpdateCompanyDetails = async (req, res) => {
  const { userId } = req.params;
  const { companyName, companyDescription, companyUrl, companyLogoUrl } = req.body;

  try {
    let logoUrl = companyLogoUrl;

    // Handle file upload if present
    if (req.file) {
      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'company_logos',
        resource_type: 'auto'
      });
      logoUrl = result.secure_url;
    }

    // If no logo URL is provided and no file was uploaded, generate a default one based on company name
    if (!logoUrl && companyName) {
      logoUrl = generateDefaultLogoUrl(companyName);
    }

    // Check if company details already exist for this creatorId
    let company = await Company.findOne({ creatorId: userId });

    if (company) {
      // Update existing company details
      company.companyName = companyName || company.companyName;
      company.companyDescription = companyDescription;
      company.companyUrl = companyUrl;
      if (logoUrl) {
        company.companyLogoUrl = logoUrl;
      }

      await company.save();
      return res.status(200).json({
        message: "Company details updated successfully",
        company,
      });
    } else {
      // Create new company details
      company = await Company.create({
        creatorId: userId,
        companyName,
        companyDescription,
        companyUrl,
        companyLogoUrl: logoUrl,
      });
      return res.status(201).json({
        message: "Company details added successfully",
        company,
      });
    }
  } catch (error) {
    console.error("Error adding/updating company details:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc Get Company Details by Creator ID
 * @route GET /api/company/:userId
 * @access Private (assuming authentication middleware provides userId)
 */
const getCompanyDetails = async (req, res) => {
  const { userId } = req.params; // Get userId from params

  try {
    const company = await Company.findOne({ creatorId: userId });

    if (!company) {
      // *** MODIFIED HERE: Send 200 OK with null company instead of 404 ***
      return res.status(200).json({
        message: "Company details not found for this user.",
        company: null, // Explicitly send null company
      });
    }

    res.status(200).json({
      company,
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addOrUpdateCompanyDetails,
  getCompanyDetails,
};
