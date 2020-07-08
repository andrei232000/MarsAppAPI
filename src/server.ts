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
    for(i = 0; i < response.data.rovers.length; i++) {
        let cameras: Camera[] = [];
        let j: number;
        for (j = 0; j < response.data.rovers[i].cameras.length; j++) {
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
    }
    return rovers;
}

async function getPhotos(rover : Rover, camera : Camera, sol : number, start : number, end : number)
{
    let i : number;
    let url : string = "https://api.nasa.gov/mars-photos/api/v1/rovers/" + rover.name + "/photos?camera=" + camera.name + "&sol=" + sol.toString() + "&page=" + start.toString() + "&api_key=T3IzvNLZcIrfAhadiAhmbDOu3DYlbpvkb0m78sfi";
    let response = await axios.get(url);
    for(i = start + 1; i < end; i++)
    {
        url = "https://api.nasa.gov/mars-photos/api/v1/rovers/" + rover.name + "/photos?camera=" + camera.name + "&sol=" + sol.toString() + "&page=" + i.toString() + "&api_key=T3IzvNLZcIrfAhadiAhmbDOu3DYlbpvkb0m78sfi";
        const responseAux = await axios.get(url);
        let j : number;
        for(j = 0; j < responseAux.data.photos.length; j++)
        {
            response.data.photos.push(responseAux.data.photos[j]);
        }
    }
    return response.data;
}

async function fetchPhotos(req, res)
{
    const rover : Rover = getRoverByName(req.params.rovername);
    const camera : Camera = getRoverCameraByName(rover, req.params.cameraname);
    let sol : number = req.query.sol;
    let page : number = req.query.page;
    let paginationStart : number = req.query.paginationStart;
    let paginationEnd : number = req.query.paginationEnd;
    if(sol == undefined) sol = 0;
    if(page == undefined)
    {
        if(paginationStart == undefined || paginationEnd == 0)
        {
            page = 0;
            paginationStart = 0;
            paginationEnd = 0;
        }
        else
        {
            page = 0;
        }
    }
    else
    {
        paginationStart = page;
        paginationEnd = page;
    }

    let i : number;
    /*for(i = paginationStart + 1; i <= paginationEnd; i++)
    {
        let response = await getPhotos(rover, camera, sol, i);
        photos.data.photos = photos.data.photos.concat(response.data.photos);
    }*/
    res.send(await getPhotos(rover, camera, sol, paginationStart, paginationEnd));
}


let rovers : Rover[] = [];

function getRoverByName(roverName : string)
{
    let i : number;
    for(i = 0; i < rovers.length; i++)
    {
        if(rovers[i].name.toLowerCase() == roverName.toLowerCase())
            return rovers[i];
    }
}

function getRoverCameraByName(rover : Rover, cameraName : string)
{
    let i : number;
    for(i = 0; i < rover.cameras.length; i++)
    {
        if(rover.cameras[i].name.toLowerCase() == cameraName.toLowerCase())
        {
            return rover.cameras[i];
        }
    }
}

app.use(express.json());
const router = express.Router();
router.get('/test', (req, res) => res.send('Hello world !'));

router.get('/rover', async (req, res) =>  {rovers = await getRovers(); res.send("Rover data updated");});
router.get('/rover/:rovername/photos/:cameraname', fetchPhotos);

app.use('/', router);

app.listen(port, () => {
    console.log(`Test backend is running on port ${port}`);
});