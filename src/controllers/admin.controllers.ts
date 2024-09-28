import { Request, Response } from 'express';
import { User } from '../models/User';
import { Admin } from '../models/Admin';
import { sign,verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import {Op} from 'sequelize';
import sequelize from 'sequelize';
import bcrypt from "bcrypt";

export class AdminController {  
    public async registeradmin(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;
            const email= data.email;
            const password = data.password;
            const saltRounds = 10; // Number of salt rounds to generate the hash
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
            const token=sign({ id: admin.id }, JWT_SECRET!);
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
            const admin = await Admin.findOne({ where: { username: data.username } });
            console.log(admin);
            if (!admin) {
                res.status(403).json({
                    err: "Invalid username or password"
                });
                return;
            }
            const adminpassword = admin.getDataValue('password');

            const isMatch = await bcrypt.compare(password, adminpassword);

            if (isMatch) {
                res.status(200).json({
                    message: "Login successful"
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
    try{
        const token = req.headers.authorization||"";
        const user=await verify(token,JWT_SECRET!);
        if(user){
            await next();

        }
        else{
            res.status(401).json({
                err:"Unauthorized"
            })
        }

    }catch(error){
        res.status(401).json({
            err:"Unable to verify user"
        })

    }
}
//---------------------------//
public async createuser(req:Request,res:Response): Promise<void>{
    try{
        const body=req.body;
        const user=await User.create({
            
                username:body.username,
                password:body.password,
                emailid:body.emailid,
                area_id:body.area_id,
                address:body.address
        });
        res.status(201).json({
            message:"User created successfully",
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            err:"Unable to create user"
        })
    }

}
//------------------------------------------//
public async getcomplaints(req:Request,res:Response):Promise<void> {
    try{
        const complaints=await Complaints.findAll({attributes:['user_id','complaint_status','id','area_id','title']});
        res.status(200).json({
            complaints
        })
    }catch{
        res.status(500).json({
            err:"Unable to get complaints"
        })
    }
}
//------------------------------------------//
public async getalluser(req:Request,res:Response):Promise<void>{
    try{
        const users=await User.findAll();
        res.status(200).json(users);
        
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            message:"Cannot fetch user details"
        })
    }
}
//------------------------------------------//
    public async getareas(req: Request, res: Response): Promise<void> {
        try {
            const areas = await Area.findAll();
            res.status(200).json(areas);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Cannot fetch Areas"
            });
        }
    }
//------------------------------------------//
public async getcomplaint(req:Request,res:Response):Promise<void>{
    try{
        const id=req.params.id;
        const complaint = await Complaints.findOne({
            where: { id: id },
            include: [
                { model: User, attributes: ['username'] }, 
                { model: Area, attributes: ['area_name'] } 
            ]
        });
        res.status(200).json({
            complaint
        })
    }catch(error){
        console.log(error)
        res.status(500).json({
            err:"Unable to get complaint"
        })
    }
}
//------------------------------------------//
public async updatecomplaint(req:Request,res:Response):Promise<void>{
    try{
        const id=req.params.id;
        const complaint_stats=req.body.complaint_status;
        const complaints=await Complaints.update({
            complaint_status:complaint_stats
        },{where:{id:id}});
        res.status(200).json({
            message:"Complaint updated successfully"
        })
    }catch{
        res.status(500).json({
            err:"Unable to update complaint"
        })
    }
}
//-------------------------------------------------------//
public async waste_byarea(req:Request,res:Response):Promise<void>{
    try {
        const areaId = req.params.id;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
        interface wasteData {
            [areaName: string]: {
                totalWeight: number;
                bioWeight: number;
                nonBioWeight: number;
                area_id:number
                areaName:string
            }; 
        }
        const whereCondition: any = { area_id: areaId };
        if (startDate && endDate) {
            whereCondition.w_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }
        const totalWeightAreaWise = await waste_produced.findAll({
            attributes: ['area_id', [sequelize.fn('SUM', sequelize.col('total_weight')), 'total_weight']],
            where: whereCondition,
            include: [{
                model: Area,
                attributes: ['area_name'], 
                required: true
            }],
            group: ['area_id']
        });
        const bioWeightAreaWise = await waste_produced.findAll({
            attributes: ['area_id', [sequelize.fn('SUM', sequelize.col('bio_weight')), 'bio_weight']],
            where: whereCondition,
            group: ['area_id']
        });
        const nonbioWeightAreaWise = await waste_produced.findAll({
            attributes: ['area_id', [sequelize.fn('SUM', sequelize.col('non_bio_weight')), 'non_bio_weight']],
            where: whereCondition,
            group: ['area_id']
        });
      
        const wasteData: wasteData = {}; 
        totalWeightAreaWise.forEach((item, index) => {
            const areaId = item.area_id;
            const areaName = item.Area?.area_name || 'Unknown'; 
            wasteData[areaName] = { 
                totalWeight: item.total_weight || 0,
                bioWeight: bioWeightAreaWise[index].bio_weight || 0,
                nonBioWeight: nonbioWeightAreaWise[index].non_bio_weight || 0,
                area_id:areaId,
                areaName:areaName
            };
        });
       console.log(wasteData);
        res.json(wasteData);
    } catch (error) {
        console.error('Error fetching waste collection:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }

}
//----------------------------------------------//
public async waste_byuser(req:Request,res:Response):Promise<void>{
    try {
        const userId = req.params.id;
        const startDate = req.query.startDate as string | undefined;
        const endDate = req.query.endDate as string | undefined;
         
        const whereCondition: any = { user_id: userId };
        if (startDate && endDate) {
            whereCondition.w_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const totalWasteByDate = await waste_produced.findAll({
            attributes: [
                'w_date',
                [sequelize.fn('SUM', sequelize.col('total_weight')), 'total_weight'],
                [sequelize.fn('SUM', sequelize.col('bio_weight')), 'bio_weight'],
                [sequelize.fn('SUM', sequelize.col('non_bio_weight')), 'non_bio_weight']
            ],
            include: [{
                model: User,
                attributes: ['username'], 
                where: { id: userId } 
            }],
            where: whereCondition,
            group: ['w_date']

        
        });
        res.json({
            totalWasteByDate
        })
    }catch(error){
        console.error('Error fetching waste collection:', error);
        res.status(500).json({
            error: 'Internal server error',

        });
    }
}
}


