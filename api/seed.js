const mongoose = require("mongoose");
const User = require("./User");
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
            imageUrl: "https://apod.nasa.gov/apod/ap950909.html",
            explanation: "In 1865 Jules Verne predicted the invention of a space capsule that could carry people. In his science fiction story "From the Earth to the Moon", he outlined his vision of constructing a cannon in Florida so powerful that it could shoot a "Projectile-Vehicle" carrying three adventurers to the Moon. Over 100 years later, NASA, guided by Wernher Von Braun's vision, produced the Saturn V rocket. This rocket turned Verne's fiction into fact, launching 9 Apollo Lunar missions and allowing 12 astronauts to walk on the Moon. Pictured above is the last moon shot, Apollo 17, awaiting a night launch in December of 1972. Spot lights play on the rocket and launch pad while the full Moon looms in the background. Humans have not walked on the lunar surface since. Should we return to the Moon?",
            date: "1995-09-09",
            source: "APOD",
            mediaType: "image",
            sourceId: "1995-09-09",
        },

        {
            user: buzz._id,
            title: "",
            imageUrl: "https://apod.nasa.gov/apod/ap950909.html",
            explanation: "In 1865 Jules Verne predicted the invention of a space capsule that could carry people. In his science fiction story "From the Earth to the Moon", he outlined his vision of constructing a cannon in Florida so powerful that it could shoot a "Projectile-Vehicle" carrying three adventurers to the Moon. Over 100 years later, NASA, guided by Wernher Von Braun's vision, produced the Saturn V rocket. This rocket turned Verne's fiction into fact, launching 9 Apollo Lunar missions and allowing 12 astronauts to walk on the Moon. Pictured above is the last moon shot, Apollo 17, awaiting a night launch in December of 1972. Spot lights play on the rocket and launch pad while the full Moon looms in the background. Humans have not walked on the lunar surface since. Should we return to the Moon?",
            date: "1995-09-09",
            source: "APOD",
            mediaType: "image",
            sourceId: "1995-09-09",
        },
    ])
}