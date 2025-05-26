const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        // acl: 'public-read',  <---- Elimina o comenta ESTA línea
        key: function (req, file, cb) {
            const extension = file.originalname.split('.').pop();
            cb(null, `event_images/${Date.now()}_${file.originalname}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/webp"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Formato de imagen no permitido"));
        }
    },
});

module.exports = upload;
