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
                const { event_name, event_description, event_price,event_teamsize } = req.body;
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };

                if (!files['event_image'] ) {
                    return res.status(400).json({ error: ' event  image are required' });
                }

                const event_image = files['event_image'][0].filename;  
                const event_qr = files['qr_image'][0].filename;        

                const event = await Event.create({
                    event_name,
                    event_description,
                    event_price,
                    event_image,
                    event_qr ,
                   event_teamsize
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
                httpOnly: false,  
                secure: false,    
                sameSite: 'none'         
            });
            
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
                    err: "Invalid email or password"
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
                    secure: false,  
                    sameSite: 'lax' 
                  });
            
            
            res.status(200).json({
                    message: "admin",
                });
             
            } else {
             console.log("Invalid email or password");
                res.status(403).json({
                    err: "Invalid email or password"
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
                    model: Event, 
                    attributes: ['event_name']
                },
                {
                    model: User, 
                    attributes: ['email', 'username'] 
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
public async verifyeventregistration(req:Request,res:Response):Promise<void>{
    try{
        const {user_id,event_id,event_verification}=req.body;
        const user = await User.findByPk(user_id);
        if(!user){
            res.status(404).json({
                err:"User not found"
            });
            return;
        }
        if(event_verification=='verified'){ const changedstatus=await EventRegistration.update({
            verification_status:'verified'
        },{
            where:{
                user_id,
                event_id
            }
        });}
        else if(event_verification=='rejected'){
            const changedstatus=await EventRegistration.update({
                verification_status:'rejected'
            },{
                where:{
                    user_id,
                    event_id
                }
            });
        }
        res.status(200).json({
            message:"Event registration verified"
        });
       
    }catch(err){
        console.error(err);
        res.status(500).json({
            err:"Unable to get user"
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