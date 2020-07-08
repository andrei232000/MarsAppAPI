import * as express from "express";
import axios from 'axios';

const app = express();
const port = 8000;

const cameras =
    {
        fhaz : "FHAZ",
        rhaz : "RHAZ",
        mast : "MAST",
        chemcam : "CHEMCAM",
        mahli : "MAHLI",
        mardi : "MARDI",
        navcam : "NAVCAM",
        pancam : "PANCAM",
        minites : "MINITES"
    };

class Camera
{
    id : number;
    name : string;
    rover_id : number;
    full_name : string;

    constructor(id : number, name : string, rover_id : number, full_name : string) {
        this.id = id;
        this.name = name;
        this.rover_id = rover_id;
        this.full_name = full_name;
    }

}

class Rover
{
    id : number;
    name : string;
    landing_date : string;
    launching_date : string;
    status : string;
    max_sol : number;
    max_date : string;
    total_photos : number;
    cameras : Camera[];

    constructor(id : number,
                name : string,
                landing_date : string,
                launching_date : string,
                status : string, max_sol : number,
                max_date : string,
                total_photos : number,
                cameras : Camera[])
    {
        this.id = id;
        this.name = name;
        this.landing_date = landing_date;
        this.launching_date = launching_date;
        this.status = status;
        this.max_date = max_date;
        this.total_photos = total_photos;
        this.cameras = cameras;
    }
}

async function getRovers()
{
    let i : number;
    let rovers : Rover[] = [];
    const response = await axios.get('https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=T3IzvNLZcIrfAhadiAhmbDOu3DYlbpvkb0m78sfi');
    console.log("data retrieved successfully");
    for(i = 0; i < response.data.rovers.length; i++)
    {
        let cameras : Camera[] = [];
        let j : number;
        console.log(response.data.rovers[i].length);
        for(j = 0; j < response.data.rovers[i].cameras.length; j++)
        {
            cameras.push(new Camera(
                response.data.rovers[i].cameras[j].id,
                response.data.rovers[i].cameras[j].name,
                response.data.rovers[i].cameras[j].rover_id,
                response.data.rovers[i].cameras[j].full_name
                ));
        }
        rovers.push(new Rover(
            response.data.rovers[i].id,
            response.data.rovers[i].name,
            response.data.rovers[i].landing_date,
            response.data.rovers[i].launching_date,
            response.data.rovers[i].status,
            response.data.rovers[i].max_sol,
            response.data.rovers[i].max_date,
            response.data.rovers[i].total_photos,
            cameras
            ));
        console.log("da");
    }
    return rovers;
}

async function getPhotos(rover : Rover, cameraName : string)
{
    const url : string = "https://api.nasa.gov/mars-photos/api/v1/rovers/" + rover.name + "/photos?api_key=T3IzvNLZcIrfAhadiAhmbDOu3DYlbpvkb0m78sfi";
    const response = await axios.get(url);
    return response.data;
}

let rovers : Rover[];

app.use(express.json());
const router = express.Router();
router.get('/test', (req, res) => res.send('Hello world !'));
router.get('/rover', async (req, res) =>  rovers = await getRovers());
router.get('/rover/photos', async (req, res) => res.send(await getPhotos(rovers[0], cameras.fhaz)));
app.use('/', router);

app.listen(port, () => {
    console.log(`Test backend is running on port ${port}`);
});