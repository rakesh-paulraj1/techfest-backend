import { Event } from "../models/Event";
import { Response,Request } from "express";
import multer from "multer";
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'events/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage }).single('event_image');
export class EventController {
  
    public async createevents(req: Request, res: Response): Promise<void> {
        upload(req, res, async (err: any) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: 'Unknown error during file upload' });
            }
            try {
                const { event_name, event_date, event_location, event_description } = req.body;
                const file = req.file;

                if (!file) {
                    return res.status(400).json({ error: 'Event image is required' });
                }

                const event_image = file.path;  
                const event = await Event.create({
                    event_name,
                    event_date,
                    event_location,
                    event_description,
                    event_image
                });

                res.status(200).json({
                    message: "Event created successfully",
                    event
                });
            } catch (error) {
                console.error('Error creating event:', error);
                res.status(500).json({
                    error: 'Internal server error',
                });
            }
        });   
     }
    
    
}