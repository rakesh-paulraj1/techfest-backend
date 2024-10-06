import { Event } from "../models/Event";
import { Response,Request } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { sign,verify } from 'jsonwebtoken';
import { JWT_SECRET } from "../config";
import { EventRegistration } from "../models/EventRegistration";
export class EventController {
    public async getallevents(req:Request,res:Response):Promise<void>{
        try{
            const events = await Event.findAll({
                attributes: [ 'event_id', 'event_name', 'event_price', 'event_description', 'event_image','event_qr'],
              });
              const eventswithimageurls = events.map((event) => ({
                ...event.dataValues,
                event_image: `http://localhost:3000/${event.event_image}`,
                event_qr: `http://localhost:3000/${event.event_qr}`,
              }));
            res.status(200).json({
                eventswithimageurls
            });

            return;
        }
        catch(e){
            res.status(500).json({
     e,error:"Server error"
            })
            return;
        }
    }
    //---------------------------//
public async deleteevent(req:Request,res:Response):Promise<void>{
        try{
            const event_id = req.params.event_id;
            const event = await Event.findByPk(event_id);
            if(!event){
                res.status(404).json({
                    error:"Event not found"
                })
                return;
            }
            await event.destroy();
            res.status(200).json({
                message:"Event deleted successfully"
            })
            return;
        }
        catch(e){
            res.status(500).json({
                error:"Server error"
            })
            return;
        }
    }
  
   //---------------------------//
   public async registeruser(req:Request,res:Response):Promise<void>{
    const { username, password, collegename, registrationnumber, email, phone, year, gender } = req.body;

   
    if (!username || !password || !collegename || !registrationnumber || !email || !phone || !year || !gender) {
         res.status(400).json({ error: 'All fields are required.' });
         return ;
    }

    try {
       
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const excistinguser = await User.findOne({ where: { email: email } });
            if (excistinguser) {
                res.status(403).json({
                    err: "User already exists"
                })
                return;
            }

            const user = await User.create({
                username,
                password: hashedPassword,
                collegename,
                registrationnumber,
                email,
                phone,
                year,
                gender
            });

        const token = sign({ id: user.user_id, role:'user' }, JWT_SECRET!);

        res.cookie("token",token,{
            httpOnly: true,         
            secure: false,         
            sameSite: 'lax'         
        });
        res.status(201).json({
            message: 'User registered successfully',
            role: 'user',
            userid: user.id,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
   //---------------------------//
   public async loginuser(req: Request, res: Response): Promise<void> {
    try {
        const data = req.body;
      
        const password = data.password;
        const user = await User.findOne({ where: { email: data.email } });
        if (!user) {
            res.status(403).json({
                err: "Invalid email or password"
            });
            return;
        }
        const userpassword = user.getDataValue('password');
        const userid = user.getDataValue('id');
        const isMatch = await bcrypt.compare(password, userpassword);
     
        if (isMatch) {
            const token = sign(
                { id: user.user_id, role: 'user' }, 
                JWT_SECRET! 
            );
        
           
            res.cookie("token", token, {
                httpOnly: true,   
                secure: true,   
                sameSite: 'lax'   
            });
        
          
            res.status(200).json({
                message: "Login successful",
                role: 'user',
                userid: userid,
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
//---------------------------//
public async usermiddleware(req: Request & { user?: any }, res: Response, next: Function): Promise<void> {
    const token = req.cookies.token || "";
        if (!token) {
            res.status(401).json({ error: "Unauthorized. No token provided." });
            return;
        }
    try {
        const user = await verify(token, JWT_SECRET!) as { role: string };
        console.log(user);
        if (user.role === 'user') {
            req.user = user;
            await next();
        } else {
            res.status(401).json({
                err: "Unauthorized role is not user"
            });
        }
    } catch (error) {
        res.status(401).json({
            err: "Unable to verify user"
        });
    }
}//---------------------------//
public async eventregistration(req: Request & { user?: any }, res: Response): Promise<void> {
    const { event_id, transaction_id, upi_id } = req.body;
   
   
    try {
         const event = await Event.findByPk(event_id);
            if (!event) {
                res.status(404).json({ error: "Event not found" });
                return;
            }
            const userid = req.user?.id;
            console.log (userid);
            if (!userid) {
                res.status(401).json({ error: "User not authenticated" });
                return;
            }
            const eventRegistration = await EventRegistration.create({
                user_id: userid,
                event_id: event_id,
                transaction_id: transaction_id,
                upi_id: upi_id
            });
            res.status(200).json({
                message: "Event registered successfully",
                eventRegistration
            });
        }
        catch (error) {
            res.status(401).json({
                err: "Unable to create events server error"
            });
        }
}//---------------------------//
public async getregisterdevents(req: Request & { user?: any }, res: Response): Promise<void> {
 
  
    try {
        const userid = req.user?.id;
        if (!userid) {
            res.status(401).json({
                err: "User not authenticated"
            });
            return;
        }
        const eventregistrations = await EventRegistration.findAll({
            where: { user_id: userid },
            include: [
                {
                    model: Event,
                    attributes: ['event_id', 'event_name', 'event_price', 'event_description', 'event_image', 'event_qr'],
                },
            ],
        });
        res.status(200).json({
            eventregistrations
        });
    }
    catch (error) {
        res.status(401).json({
            err: "Unable to fetch registered events"
        });
    }
}
//---------------------------//

//---------------------------//
public async userlogout(req: Request, res: Response): Promise<void> {
    res.clearCookie("token");
    res.status(200).json({
        message: "Logout successful"
    });
}
}