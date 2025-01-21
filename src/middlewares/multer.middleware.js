import multer from "multer";

// Set storage engine
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/temp/")
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
}); 

export const upload = multer({
    storage:storage
})