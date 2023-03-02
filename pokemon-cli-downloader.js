import fs from "fs/promises"
import inquirer from "inquirer";
import path from "path";
let inp = async()=>{
    return await inquirer.prompt([
        {
            type:"input",
            name:"name",
            message:"your pokemon name"
        }
    ])
}
let checkbox = async()=>{
    return await inquirer.prompt({
        type:"checkbox", 
        name:"choosen",
        message:"choose data",
        choices:[
            new inquirer.Separator("......options.........."),
            {name:"Stats"},
            {
            name:"Sprites"
        },
        {
            name:"Artwork"
        }]

    });
};
let list = async()=>{
    return await inquirer.prompt({
        type: "list",
        name:"continue",
        message:"would you like to search for another pokemon ?",
        choices:["yes","no"]
    }
    )
}

let fetchpokemon = async(pokemonname)=>{
    let url = `https://pokeapi.co/api/v2/pokemon/${pokemonname}`;
    let res = await fetch(url);
    let json =await res.json();
    return json;
}
// fetchpokemon("pikachu").then((json)=>{
// console.log(json.stats)
// })
let promptuser= async()=>{
    while(true){
        let input = await inp();
        let pokjson = await fetchpokemon(input.name);
        console.log(pokjson.name,pokjson.weight);
        let check = await checkbox();
        console.log(check.choosen);
        await parseoptions(pokjson,check);
        let options = await list();
        if(options.continue === "no") break;
    }

}

let createfolder = async(folder)=>{
let currentdir = process.cwd();
let folderpath = path.join(currentdir,folder)
try{
    await fs.access(folder)
}catch{
    fs.mkdir(folder)
}
}
// let fetchobjstats = await fetchpokemon("pikachu");
let pokemonstats = async(foldername,obj)=>{
    let itr = "";
    for(let stat of obj){
        itr+=`${stat.stat.name} : ${stat.base_stat}\n`
    }
    console.log(itr)

await createfolder(foldername);
let filepath = path.join(process.cwd(),foldername,"stats.txt");
await fs.writeFile(filepath,itr)
}

let saveimg = async(filepath,arraybuffer)=>{
    await fs.writeFile(filepath,Buffer.from(arraybuffer))
}
let saveartwork = async(foldername,pokemonspriteobj)=>{
    let url = pokemonspriteobj.other["official-artwork"].front_default;
    let res = await fetch(url);
    let arraybuffer = await res.arrayBuffer();
    await createfolder(foldername);
    let filepath = path.join(process.cwd(),foldername,"artwork.png")
    await saveimg(filepath,arraybuffer)
}
// getdata("salman",fetchobjstats.stats)
let pokemonsprites = async(foldername,pokemonspriteobj)=>{
    let spritepromise =[];
    let spritenames =[];
    for(let [name,url] of object.entries(pokemonspriteobj)){
        if(!url)continue;
        if(name === "other"||name==="versions")continue;

        spritepromise.push(fetch(url).then((res)=>{
            res.arrayBuffer()
        }))
        spritenames.push(name);
}
spritepromise = await Promise.all(spritepromise);
await createfolder(foldername);
for(let i=0;i<spritepromise.length;i++){
    let filepath = path.join(process.cwd(),foldername,`${spritename[i]}.png`);
    await saveimg(filepath,spritepromise[i]);
    console.log(`saved:${filepath}`)
};
};
let parseoptions = async(pokemonobj,optionsobj)=>{
    let options = optionsobj.options;
    let pokemonname = pokemonobj.name;
    if(options.includes("Stats")){
        await pokemonstats(pokemonname,pokemonobj.stats)
    };
    if(options.includes("Sprites")){
        await pokemonsprites(pokemonname,pokemonobj.sprites)
    }
    if(options.includes("Artwork")){
        await saveartwork(pokemonname,pokemonobj.sprites)
    }
};
 await promptuser();
await parseoptions()