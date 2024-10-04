import { Event } from "../models/Event";
import { Response,Request } from "express";
export class EventController {
    public async getallevents(req:Request,res:Response):Promise<void>{
        try{
            const events = await Event.findAll({
                attributes: [ 'event_id', 'event_name', 'event_price', 'event_description', 'event_image'],
              });
              const eventswithimageurls = events.map((event) => ({
                ...event.dataValues,
                event_image: `http://localhost:3000/${event.event_image}`,
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
  
    
}