/*
Copyright © 2021 JustFox

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const {uri, port} = require("./config.json")

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(r => console.log("Connected to database"))
    .catch(err => console.log(err))



const accountSchema = new Schema({ 
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const accounts = mongoose.model("accounts", accountSchema)
const app = express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const emailTest = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/

app.post("/login", async (req, res) => { //login post
    let body = {
        ok: false,
        email: req.body.email || false,
        password: req.body.password || false,
    }

    const account = await accounts.findOne({email: body.email})

    console.log(account)

    if(!body.email || !emailTest.test(body.email) || !account || !body.password)
        return res.json(body)


    if(account.password != body.password)
        return res.json(body)

    body.ok = true

    console.log(account)

    res.json(body)
})

app.post("/register", async (req, res) => { //register post
    let body = {
        ok: false,
        email: req.body.NEmail || false,
        password: req.body.NPassword || false,
        rpassword: req.body.RNPassword || false
    }

    const account = await accounts.findOne({email: body.email})

    if(!body.email || !emailTest.test(body.email) || account || !body.password || (body.password != body.rpassword))
        return res.json(body)

    const newAccount = new accounts({
        email: body.email,
        password: body.password
    })

    await newAccount.save()
    body.ok = true

    res.json(body)
})

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "show/index.html"))) //main site

app.post("/error", (req, res) => res.redirect("/")) //error post (Main button)

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "show/error.html"))) //error site

app.listen(port, () => console.log(`Listening on ${port}`)) //start listenning