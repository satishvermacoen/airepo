import * as multer from 'multer';
import { MulterAzureStorage } from 'multer-azure-blob-storage';

// Generate a unique blob name using original filename and timestamp
const resolveBlobName = (req, file) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        const blobName = `${file.fieldname}-${timestamp}.${extension}`;
        resolve(blobName);
    });
};

// Optionally add metadata (can be empty or customized)
const resolveMetadata = (req, file) => {
    return new Promise((resolve, reject) => {
        const metadata = {
            originalname: file.originalname,
            mimetype: file.mimetype
        };
        resolve(metadata);
    });
};

// Set content settings for the uploaded blob
const resolveContentSettings = (req, file) => {
    return new Promise((resolve, reject) => {
        const contentSettings = {
            contentType: file.mimetype
        };
        resolve(contentSettings);
    });
};

const azureStorage = new MulterAzureStorage({
    connectionString: 'DefaultEndpointsProtocol=https;AccountName=mystorageaccountname;AccountKey=wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY;EndpointSuffix=core.windows.net',
    accountName: 'mystorageaccountname',
    containerName: 'documents',
    blobName: resolveBlobName,
    metadata: resolveMetadata,
    contentSettings: resolveContentSettings,
    containerAccessLevel: 'blob',
    urlExpirationTime: 60
});

const upload = multer({
    storage: azureStorage
});

export default upload;