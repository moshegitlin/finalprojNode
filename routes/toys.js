const express= require("express");
const validator = require('validator')
const {ToySchema, validateToy} = require("../models/toysModel");
const {auth} = require("../middlewares/auth");
const router = express.Router();

// http://localhost:3001/toys/count
router.get('/count', async (req, res,next) => {
    try{
        const count = await ToySchema.countDocuments({});
        console.log(!count?"no count":"yes count");
        res.status(200).json({count});
    }catch (err){
        res.status(502).json(err);
    }
})
// http://localhost:3001/toys
// http://localhost:3001/toys/_id
// http://localhost:3001/toys/category
// http://localhost:3001/toys?perPage=5
// http://localhost:3001/toys?perPage=5&name=name
// http://localhost:3001/toys?perPage=5&info=info
// http://localhost:3001/toys?perPage=5&min=100&max=200

router.get('/:param?', async (req, res, next) => {
    try {
        const param = req.params.param;
        let category, id;
        if (param) {
            if (validator.isMongoId(param)) {
                id = param;
            } else {
                category = param;
            }
        }

        const perPage = Math.min(req.query.perPage || 10, 10);
        const { name, info, min, max } = req.query;
        const query = {};
        if (id) {
            query._id = id;
        }
        if (min) {
            query.price = { $gte: min };
        }
        if (max) {
            query.price = { $lte: max };
        }
        if (category) {
            query.category = category;
        }
        if (name) {
            query.name = { $regex: new RegExp(name), $options: 'i' };
        }
        if (info) {
            query.info = { $regex: new RegExp(info), $options: 'i' };
        }

        const data = await ToySchema.find({
            $or:[query]
        }).limit(perPage);
        if (data.length === 0 && category) {
            next();
            return;
        }
        res.json(data);
    } catch (err) {
        res.status(502).json(err);
    }
});
// http://localhost:3001/toys
//need to send token in the header key:x-api-key
router.post('/',auth, async (req, res) => {
    const {error} = validateToy(req.body);
    if(error) return res.status(400).json(error.details[0].message);
    try{
       let newToy = await new ToySchema(req.body);
         newToy.user_id = req.tokenData._id;
        await newToy.save();
        res.status(200).json(newToy);
    }catch (err){
        res.status(502).json(err);
    }
})
// http://localhost:3001/toys/_id
//need to send token in the header key:x-api-key
router.put('/:id',auth, async (req, res) => {
    const {error} = validateToy(req.body);
    if(error) return res.status(400).json(error.details[0].message);
    try{
        const data = await ToySchema.findOne({_id:req.params.id});
        if(!data.user_id.equals(req.tokenData._id)) return res.status(401).json({msg:"You can't edit this toy"});
        const updated = await ToySchema.updateOne({_id:req.params.id},req.body);
        res.json(updated);
    }catch (err){
        res.status(502).json(err);
    }
})
// http://localhost:3001/toys/_id
//need to send token in the header key:x-api-key
router.delete('/:id',auth, async (req, res) => {

    try {
        const data = await ToySchema.findOne({_id: req.params.id});
        if (!data.user_id.equals(req.tokenData._id)) return res.status(401).json({msg: "You can't edit this toy"});
        const deleted = await ToySchema.deleteOne({_id: req.params.id});
        res.json(deleted);
    } catch (err) {
        res.status(502).json(err);
    }
})

module.exports = router;