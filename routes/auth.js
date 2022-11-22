import express from "express";
import Auth from '../models/authM.js'
import multer from 'multer'
import * as path from 'path';
import fileUpload from 'express-fileupload'
import { v2 as cloudinary } from 'cloudinary'
import { url } from "inspector";

const authrouter = express.Router()

cloudinary.config({ 
  cloud_name: 'dl3967ict', 
  api_key: '553433425895836', 
  api_secret: 'atvtwuN24iK9-R2d_rTzG2GxmKg' 
});


//FILE STORAGE QUERY START........................
const storage = multer.diskStorage({
  //  destination: './public/assets/images',
  
  filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});
//FILE STORAGE QUERY END....................................................................................


//FILE FILTER QUERY START....................................................................................
const filefilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' 
      || file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf'){
          cb(null, true);
      }else {
          cb(null, false);
      }

}
const upload= multer({storage:storage, fileFilter:filefilter})
//post method..................

// authrouter.use('/public/assets/images', express.static('public/assets/images'));
// authrouter.post("/post",upload.single('Photo'), async (req, res) => {
  authrouter.post("/post", async (req, res) => {
const file= req.files.Photo
cloudinary.uploader.upload(file.tempFilePath,(err,result)=>{

  // console.log(result);
  //   try{
    const files = new Auth({
        // Photo: result.url,
        Photo: result.secure_url,
      cloudinary_id: result.public_id,
        Name: req.body.Name,
        Post:req.body.Post,
        Description:req.body.Description,
        Active:req.body.Active
  
    });
     files.save();
    res.status(200).send(files);
// }catch(error) {
//     res.status(400).send("error");
//  }
})
})


// authrouter.post("/post", upload.single('Photo'),async(req,res)=>{
//   try {
//     const file= req.files.Photo
//     const result = await cloudinary.uploader.upload(file.tempFilePath);

//     // Create new user
//     let user = new Auth({
//       Name: req.body.Name,
//       Photo: result.secure_url,
//       cloudinary_id: result.public_id,
//     });
//     // Save user
//     await file.save();
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

authrouter.get("/", async (req, res) => {
  try {
    let user = await Auth.find({});
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});





//get by id method..................................
// authrouter.get("/get/:id",async(req,res)=>{

//   try{
//   const _id= req.params.id
//   const details= await Auth.findById(_id)

//   res.status(200).send(details)
// }
//   catch(err)
//   {
//     res.status(400).send("error")
//   }
// })

//get all.....................................
// authrouter.get("/all",async(req,res)=>{

//   try{
//   const record= await Auth.find({})

//   res.status(200).send(record)
// }
//   catch(err)
//   {
//     res.status(400).send("error")
//   }
// })

//update details..........................................
authrouter.put("/update/:id", async (req, res) => {
  try {
    const file= req.files.Photo

    let user = await Auth.findById(req.params.id);
    // Delete image from cloudinary
    const dis= await cloudinary.uploader.destroy(file.tempFilePath);
    // Upload image to cloudinary
    let result;
    if (dis) {
      result = await cloudinary.uploader.upload(file.tempFilePath);
    }
    const data = {
      Name: req.body.Name || user.Name,
      Photo: result?.secure_url || user.Photo,
      cloudinary_id: result?.public_id || user.cloudinary_id,
    };
    user = await Auth.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

//delete method ......................................
authrouter.delete("/delete/:id", async (req, res) => {
  try {
    // Find user by id
    let user = await Auth.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(user.cloudinary_id);
    // Delete user from db
    await user.remove();
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});
export default authrouter