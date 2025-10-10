import fs from 'fs';
import type { Request, Response } from "express";
import Image from "../models/images.js";
import { uploadToCloudinary } from "../helpers/cloudianryHelper.js";

const uplaodImage = async (req: Request, res: Response) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { url, publicId } = await uploadToCloudinary(req.file.path);
        const newImage = new Image({
            url,
            publicId,
            uploadedBy: req.user.userId,
        });
        await newImage.save();
        fs.unlinkSync(req.file.path); // Delete the file from local storage after upload
        return res.status(201).json({ message: "Image uploaded successfully", image: newImage });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error " });
    }
}

const getAllImages = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy === 'createdAt' ? 'createdAt' : 'uploadedBy';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const totalmages = await Image.countDocuments();
    const totalPages = Math.ceil(totalmages / limit);

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    try {
        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);
        return res.status(200).json({ success: true, data: images, totalPages, currentPage: page, totalmages });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
}

export { uplaodImage, getAllImages };