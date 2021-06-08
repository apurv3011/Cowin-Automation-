function pingCowin({ key, hook, age, districtId, appointmentsListLimit, date, pin, vaccine, dose, keepAlive }) {
    // get current date on every iteration if not custom date
    date = date || format(new Date(), 'dd-MM-yyyy')

    let url = pin ? `${baseUrl}calendarByPin?pincode=${pin}&date=${date}` : `${baseUrl}calendarByDistrict?district_id=${districtId}&date=${date}`

    const ageLimit = age >= 18 && age < 45 ? 18 : 45;

    axios.get(url, { headers: { 'User-Agent': sampleUserAgent } }).then((result) => {
        const { centers } = result.data;
        let isSlotAvailable = false;
        let dataOfSlot = "";
        let appointmentsAvailableCount = 0;
        if (centers.length) {
            centers.forEach(center => {
                center.sessions.forEach((session => {
                    if (session.min_age_limit === ageLimit && session.available_capacity > 0) {
                        if (dose === 1 && session.available_capacity_dose1 <= 0) {
                            return;
                        }
                        if (dose === 2 && session.available_capacity_dose2 <= 0) {
                            return;
                        }
                        if (vaccine && vaccine.toLowerCase() !== session.vaccine.toLowerCase()) {
                            return;
                        }
                        isSlotAvailable = true
                        appointmentsAvailableCount++;
                        if (appointmentsAvailableCount <= appointmentsListLimit) {
                            dataOfSlot = `${dataOfSlot}\n[${center.pincode}] - Slot for ${session.available_capacity} is available: ${center.name} on ${session.date}`;
                        }
                    }
                }))
            });

            if (appointmentsAvailableCount - appointmentsListLimit) {
                dataOfSlot = `${dataOfSlot}\n${appointmentsAvailableCount - appointmentsListLimit} more slots available...`
            }
        }
        if (isSlotAvailable) {
            if (hook && key) {
                axios.post(`https://maker.ifttt.com/trigger/${hook}/with/key/${key}`, { value1: dataOfSlot }).then(() => {
                    console.log(dataOfSlot);
                    sound.play(notificationSound);
                    console.log('Sent Notification to Phone')
                    if (!keepAlive) {
                        console.log('Stopping Pinger...')
                        clearInterval(timer);
                    }
                });
            } else {
                console.log(dataOfSlot);
                sound.play(notificationSound, 1);
                console.log('Slots found')
                if (!keepAlive) {
                    console.log('Stopping Pinger...')
                    clearInterval(timer);
                }
            }
        }
    }).catch((err) => {
        console.log("Error: " + err.message);
    });
}