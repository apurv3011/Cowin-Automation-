const baseUrl = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/';
const puppeteer = require('puppeteer');
const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const axios = require('axios');
const sound = require("sound-play");
const { format } = require('date-fns');
const path = require("path");
const sampleUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
var argv = require('minimist')(process.argv.slice(2));
const filePath = path.join(__dirname, "./RES/iPhone Message Tone.mp3");

var defaultInterval= 52;



function checkParam(){


const params = {
    vaccine: argv.vaccine , // vaccine = COVISHIELD , COVAXIN, SPUTNIK
    dose: argv.dose, // dose = 1, 2
    // key: argv.key,
    // hook: argv.hook,
    age: argv.age,
    districtId: argv.district,
    interval: argv.interval || defaultInterval,
    // appointmentsListLimit: argv.appts || appointmentsListLimit,
    date: argv.date ||  format(new Date(), 'dd-MM-yyyy'),
    pin: argv.pin,
    // keepAlive: argv['keep-alive'] ? argv['keep-alive'].toLowerCase() === 'true' : defaultKeepAlive
}

// console.log(argv);
console.log('\nCowin Pinger started succesfully\n');
console.log(`Date= ${params.date || format(new Date(), 'dd-MM-yyyy')}`);
console.log(`Age= ${params.age}`);
console.log(`Dose= ${params.dose === 1 ? 'First Dose' : 'Second Dose'}`);
params.vaccine && console.log(`Vaccine= ${params.vaccine.toUpperCase()}`);
console.log(params.districtId);

// console.log
scheduleCowinNotification(params);

}

function scheduleCowinNotification({ age, districtId,  date,  vaccine, dose, }){

    
const ageLimit = age >= 18 && age < 45 ? 18 : 45;

    let url =  `${baseUrl}calendarByDistrict?district_id=${districtId}&date=${date}`;
   
    axios.get(url, { headers: { 'User-Agent': sampleUserAgent } })
    .then((result) => {
       let {centers} = result.data;
       let slotKadate = "";
       let isSlotAvailable = false;

       if(centers.length > 0){
        centers.forEach(onecenter => {
            onecenter.sessions.forEach(persession => {
                if(persession.min_age_limit === ageLimit && persession.available_capacity > 0){
                    if(dose === 1 && persession.available_capacity_dose1 <= 0)
                    return;

                    if(dose === 2 && persession.available_capacity_dose2 <= 0)
                    return;

                        // if(vaccine && vaccine.toLowerCase() !== persession.vaccine.toLowerCase())
                        // return;

                    isSlotAvailable = true;
                    slotKadate = `${slotKadate} - [${onecenter.pincode}] - Slot for ${persession.available_capacity} is available: ${onecenter.name} on ${persession.date}`;
                    // console.log(slotKadate);


                }else{
                    console.log("no slot found in last 7 days...");
                }
            });
        });

        
       }if (isSlotAvailable) {
       
        console.log(slotKadate);
        sound.play(filePath, 1);
        console.log('Slots found')
        // if (!keepAlive) {
        //     console.log('Stopping Pinger...')
        //     clearInterval(timer);
        // }
       }

       
    //    console.log(centers);
    // fs.writeFileSync("./temp.json" , JSON.stringify(centers));

    
//     for (let i = 0; i < centers.length; i++) {
//            let element = centers[i];
           
//     // fs.writeFileSync("./temp.json" , JSON.stringify(element));

//     //     //    console.log(element);
//   console.log(element.name + "->" +"paid : " + element.fee_type + "->" +  element.sessions[0].available_capacity);
//        }
       
    });
}

checkParam();
// getParam(baseUrl , 104 ,01-06-2021 );