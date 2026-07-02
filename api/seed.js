const mongoose = require("mongoose");
const User = require("./models/User");
const Favourite = require("./models/Favourite");
require("dotenv").config();

async function seed () {
    await mongoose.connect(process.env.MONGODB_URL);

    await Favourite.deleteMany({});
    await User.deleteMany({});

    const buzz = await User.create({
        username: "Buzz",
        email: "buzz@email.com",
        password: "Password1!",
    });

    await Favourite.create([
        {
            user: buzz._id,
            title: "The Last Moon Shot",
            imageUrl: "https://apod.nasa.gov/apod/image/apollo17.gif",
            explanation: `In 1865 Jules Verne predicted the invention of a space capsule that could carry people. In his science fiction story From the Earth to the Moon, he outlined his vision of constructing a cannon in Florida so powerful that it could shoot a "Projectile-Vehicle" carrying three adventurers to the Moon. Over 100 years later, NASA, guided by Wernher Von Braun's vision, produced the Saturn V rocket. This rocket turned Verne's fiction into fact, launching 9 Apollo Lunar missions and allowing 12 astronauts to walk on the Moon. Pictured above is the last moon shot, Apollo 17, awaiting a night launch in December of 1972. Spot lights play on the rocket and launch pad while the full Moon looms in the background. Humans have not walked on the lunar surface since. Should we return to the Moon?`,
            date: "1995-09-09",
            source: "APOD",
            mediaType: "image",
            sourceId: "1995-09-09",
        },
        {
            user: buzz._id,
            title: "The Colorful Clouds of Rho Ophiuchi",
            imageUrl: "https://apod.nasa.gov/apod/image/rho_uks.gif",
            explanation: `The many spectacular colors of the Rho Ophiuchi (oh'-fee-yu-kee) clouds highlight the many processes that occur there. The blue regions shine primarily by reflected light. Blue light from the star rho Ophiuchi and nearby stars reflects more efficiently off this portion of the nebula than red light. The Earth's daytime sky appears blue for the same reason. The red and yellow regions shine primarily because of emission of the nebula's atomic and molecular gas. Light from nearby stars - particularly the bright star Antares in this case - knocks electrons away from the gas, which then shines when the electrons recombine with the gas. The dark regions are caused by dust grains - born in young stellar atmospheres - which effectively block light emitted behind them. The Rho Ophiuchi star clouds, well in front of the globular cluster M4 visible on far lower left, are even more colorful than humans can see - the clouds emits light in every wavelength band from the radio to the gamma-ray.`,
            date: "1996-03-12",
            source: "APOD",
            mediaType: "image",
            sourceId: "1996-03-12",
        },
        {
            user: buzz._id,
            title: "A Galaxy Collision in NGC 6745",
            imageUrl: "https://apod.nasa.gov/apod/image/1209/ngc6745_hst_755.jpg",
            explanation: `Galaxies don't normally look like this. NGC 6745 actually shows the results of two galaxies that have been colliding for only hundreds of millions of years. Just off the above digitally sharpened photograph to the lower right is the smaller galaxy, moving away. The larger galaxy, pictured above, used to be a spiral galaxy but now is damaged and appears peculiar. Gravity has distorted the shapes of the galaxies. Although it is likely that no stars in the two galaxies directly collided, the gas, dust, and ambient magnetic fields do interact directly. In fact, a knot of gas pulled off the larger galaxy on the lower right has now begun to form stars. NGC 6745 spans about 80 thousand light-years across and is located about 200 million light-years away.`,
            date: "2012-09-30",
            source: "APOD",
            mediaType: "image",
            sourceId: "2012-09-30",
        },
        {
            user: buzz._id,
            title: "The Witch Head Nebula",
            imageUrl: "https://apod.nasa.gov/apod/image/1510/IC2118_A_full.jpg",
            explanation: `Double, double toil and trouble; Fire burn, and cauldron bubble .... maybe Macbeth should have consulted the Witch Head Nebula. A frighteningly shaped reflection nebula, this cosmic crone is about 800 light-years away though. Its malevolent visage seems to glare toward nearby bright star Rigel in Orion, just off the right edge of this frame. More formally known as IC 2118, the interstellar cloud of dust and gas is nearly 70 light-years across, its dust grains reflecting Rigel's starlight. In this composite portrait, the nebula's color is caused not only by the star's intense bluish light but because the dust grains scatter blue light more efficiently than red. The same physical process causes Earth's daytime sky to appear blue, although the scatterers in planet Earth's atmosphere are molecules of nitrogen and oxygen.`,
            date: "2015-10-30",
            source: "APOD",
            mediaType: "image",
            sourceId: "2015-10-30",
        },
        {
            user: buzz._id,
            title: "Change 5 Mission Launch",
            imageUrl: "https://apod.nasa.gov/apod/image/2011/IMG_20201124052235_9280.jpg",
            explanation: `This Long March-5 rocket blasted off from the Wenchang launch site in southernmost Hainan province on Tuesday November 24, at 4:30 am Beijing Time, carrying China's Chang'e-5 mission to the Moon. The lunar landing mission is named for the ancient Chinese goddess of the moon. Its goal is to collect about 2 kilograms (4.4 pounds) of lunar material from the surface and return it to planet Earth, the first robotic sample return mission to the Moon since the Soviet Union's Luna 24 mission in 1976. The complex Chang'e-5 mission landing target is in the Oceanus Procellarum (Ocean of Storms). The smooth volcanic plain was also visited by the Apollo 12 mission in 1969. Chang'e-5's lander is solar-powered and scheduled to operate on the lunar surface during its location's lunar daylight, which will last about two Earth weeks, beginning around November 27. A capsule with the lunar sample on board would return to Earth in mid-December.`,
            date: "2020-11-27",
            source: "APOD",
            mediaType: "image",
            sourceId: "2020-11-27",
        },
        {
            user: buzz._id,
            title: "M16 Close Up",
            imageUrl: "https://apod.nasa.gov/apod/image/2109/M16SHO.jpg",
            explanation: `A star cluster around 2 million years young surrounded by natal clouds of dust and glowing gas, M16 is also known as The Eagle Nebula. This beautifully detailed image of the region adopts the colorful Hubble palette and includes cosmic sculptures made famous in Hubble Space Telescope close-ups of the starforming complex. Described as elephant trunks or Pillars of Creation, dense, dusty columns rising near the center are light-years in length but are gravitationally contracting to form stars. Energetic radiation from the cluster stars erodes material near the tips, eventually exposing the embedded new stars. Extending from the ridge of bright emission left of center is another dusty starforming column known as the Fairy of Eagle Nebula. M16 lies about 7,000 light-years away, an easy target for binoculars or small telescopes in a nebula rich part of the sky toward the split constellation Serpens Cauda (the tail of the snake).`,
            date: "2021-09-09",
            source: "APOD",
            mediaType: "image",
            sourceId: "2021-09-09",
        },
        {
            user: buzz._id,
            title: "A Long Snaking Filament on the Sun",
            imageUrl: "https://apod.nasa.gov/apod/image/2209/SnakingFilament_Friedman_960.jpg",
            explanation: `Earlier this month, the Sun exhibited one of the longer filaments on record. Visible as the bright curving streak around the image center, the snaking filament's full extent was estimated to be over half of the Sun's radius -- more than 350,000 kilometers long. A filament is composed of hot gas held aloft by the Sun's magnetic field, so that viewed from the side it would appear as a raised prominence. A different, smaller prominence is simultaneously visible at the Sun's edge. The featured image is in false-color and color-inverted to highlight not only the filament but the Sun's carpet chromosphere. The bright dot on the upper right is actually a dark sunspot about the size of the Earth. Solar filaments typically last from hours to days, eventually collapsing to return hot plasma back to the Sun. Sometimes, though, they explode and expel particles into the Solar System, some of which trigger auroras on Earth. The pictured filament appeared in early September and continued to hold steady for about a week.`,
            date: "2022-09-13",
            source: "APOD",
            mediaType: "image",
            sourceId: "2022-09-13",
        },
        {
            user: buzz._id,
            title: "The Cotton Candy Clouds of Rho Ophiuchi",
            imageUrl: "https://apod.nasa.gov/apod/image/2607/rho_ophiuchi_1024.png",
            explanation: `Although they look like cotton candy, you cannot eat these clouds! Taken in Cádiz, Spain, today's image features the Rho Ophiuchi complex, a rich tapestry of young and old astronomical phenomena. This colorful cloud complex is a nearby star-forming region containing hundreds of young stellar objects, including protostars and T Tauri stars. Light from the triple star system at its center reflects off of small dust grains to create the blue reflection nebula. Ultraviolet light from hot stars ionizes the surrounding hydrogen gas, creating the red emission nebula. Antares, a red supergiant big enough to engulf the Solar System's asteroid belt, lights up the yellow region. Dark interstellar dust blocks some of the complex's color. Recent JWST observations exhibit shadows cast by hidden circumstellar disks, the beginning stages of planet formation. Messier 4, a globular cluster almost as old as the universe, sits in the bottom right and witnesses yet another chaotic burst of youth in the Milky Way.`,
            date: "2026-07-01",
            source: "APOD",
            mediaType: "image",
            sourceId: "2026-07-01",
        },
        {
            user: buzz._id,
            title: "Sibling Supernova Remnants",
            imageUrl: "https://apod.nasa.gov/apod/image/2607/sibling_supernovae.jpg",
            explanation: `What happens when one of the stars in a binary goes supernova? This image combines visible (yellow), ultraviolet (purple) and infrared light (cyan, red and orange) to show two supernova remnants and their surrounding environment, about 6,000 light-years away. The younger one is the well-known Jellyfish Nebula in the center (mostly in yellow). If we could see it by eye, it would appear larger than the full moon in the sky. The filament shown in purple is part of an older, overlapping supernova remnant, G189.6+3.3. A new study used data from NASA's Fermi Gamma-ray Space Telescope to piece together their story. Astronomers believe that there were two stars in a binary system, then the first one exploded as a supernova, kicking away its companion, which also exploded as a supernova tens of thousands of years later, creating the superimposed supernova remnants we see today. The bright star on the right is actually a triple star system named Propus.`,
            date: "2026-07-02",
            source: "APOD",
            mediaType: "image",
            sourceId: "2026-07-02",
        },
    ]);

    console.log("Seeded a user and their favourites");
    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    mongoose.disconnect();
});