import { Request, Response } from 'express';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { sign,verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { Event } from '../models/Event';
import bcrypt from "bcrypt";
import multer from "multer";
import { EventRegistration } from '../models/EventRegistration';
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/'); 
//     },
//     filename: (req, file, cb) => {
//       cb(null, file.originalname); 
//     }
//   });
// const upload = multer({ storage }).single('file');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); 
    }
});

const upload = multer({ storage }).fields([
    { name: 'event_image', maxCount: 1 },
    { name: 'qr_image', maxCount: 1 }
]);


export class AdminController {  
    // public async createevents(req: Request, res: Response): Promise<void> {
    //     upload(req, res, async (err: any) => {
    //         if (err instanceof multer.MulterError) {
    //             return res.status(500).json({ error: err.message });
    //         } else if (err) {
    //             console.log(err);
    //             return res.status(500).json({ error: 'Unknown error during file upload' });
    //         }
    //         try {
    //             console.log(req.body);
    //             const { event_name, event_description,event_price } = req.body;
    //             const file = req.file;

    //             if (!file) {
    //                 return res.status(400).json({ error: 'Event image is required' });
    //             }

    //             const event_image = file.filename;  
    //             const event = await Event.create({
    //                 event_name,
    //                 event_description,
    //                 event_price,
    //                 event_image
    //             });

    //             res.status(200).json({
    //                 message: "Event created successfully",
    //                 event
    //             });
    //         } catch (error) {
    //             console.error('Error creating event:', error);
    //             res.status(500).json({
    //                 error: 'Internal server error da',
    //             });
    //         }
    //     });   
    //  }
    public async createevents(req: Request, res: Response): Promise<void> {
        upload(req, res, async (err: any) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: err.message });
            } else if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Unknown error during file upload' });
            }
            try {
                const { event_name, event_description, event_price } = req.body;
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };

                if (!files || !files['event_image'] || !files['qr_image']) {
                    return res.status(400).json({ error: 'Both event image and QR image are required' });
                }

                const event_image = files['event_image'][0].filename;  
                const qr_image = files['qr_image'][0].filename;        

                const event = await Event.create({
                    event_name,
                    event_description,
                    event_price,
                    event_image,
                    event_qr: qr_image  
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
        });       }

       //----------------------------------------------//
    public async registeradmin(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const email= data.email;
            const password = data.password;
            const saltRounds = 10; 
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const excistingadmin = await Admin.findOne({ where: { email: email } });
            if (excistingadmin) {
                res.status(403).json({
                    err: "Admin already exists"
                })
                return;}
            const admin = await Admin.create({
                username: data.username,
                password: hashedPassword,
                email: data.email
            });
            const adminid = admin.getDataValue('id');
            const token=sign({ id: adminid }, JWT_SECRET!);
            res.cookie("token",token,{
                httpOnly: true,         
                secure: false,         
                sameSite: 'lax'         
            });
            res.status(200).json({
                message: "Admin Registered Successfully",
              
            })
        } catch (err) {
            console.error(err);
            res.status(500).json({
                err: "Unable to register admin"
            })
        }
    }     
    

    //----------------------------------------------//
    public async loginadmin(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
          
            const password = data.password;
            const admin = await Admin.findOne({ where: { email: data.email } });
            if (!admin) {
                res.status(403).json({
                    err: "Invalid username or password"
                });
                return;
            }
            const adminpassword = admin.getDataValue('password');
            const adminid = admin.getDataValue('id');
            const isMatch = await bcrypt.compare(password, adminpassword);
         
            if (isMatch) {
                const token = sign(
                    { id: adminid, role: 'admin' }, 
                    JWT_SECRET! 
                );
            
               
                res.cookie("token", token, {
                    httpOnly: true,   
                    secure: true,   
                    sameSite: 'lax'   
                });
            
              
                res.status(200).json({
                    message: "Login successful",
                    role: 'admin',
                });
            } else {
             
                res.status(403).json({
                    err: "Invalid username or password"
                });
            }
            
        } catch (err) {
            console.error(err, "error");
            res.status(500).json({ error: 'Internal server error' });
        }
    }    
    //----------------------------------------------//
public async adminmiddleware(req: Request, res: Response, next: Function): Promise<void> {
    const token = req.cookies.token || "";
        if (!token) {
            res.status(401).json({ error: "Unauthorized. No token provided." });
            return;
        }
    try {
        const user = await verify(token, JWT_SECRET!) as { role: string };
        if (user.role === 'admin') {
            await next();
        } else {
            res.status(401).json({
                err: "Unauthorized role is not admin"
            });
        }
    } catch (error) {
        res.status(401).json({
            err: "Unable to verify user"
        });
    }
}//---------------------------//
public async registrationdetails(req: Request, res: Response): Promise<void> {
    try {
        const admin = await EventRegistration.findAll({
            include: [
                {
                    model: Event, // Include the Event model
                    attributes: ['event_name'] // Select the event name
                },
                {
                    model: User, // Include the User model
                    attributes: ['email', 'username'] // Select the user email and username
                }
            ]
        });
        res.status(200).json({
            admin
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            err: "Unable to get admin details"
        });
    }
}
//---------------------------//
public async adminlogout(req: Request, res: Response): Promise<void> {
    res.clearCookie("token");
    res.status(200).json({
        message: "Logout successful"
    });
}
//---------------------------//

}

