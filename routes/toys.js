const express = require("express");
const validator = require('validator')
const { ToySchema, validateToy } = require("../models/toysModel");
const { auth } = require("../middlewares/auth");
const router = express.Router();

router.get('/count', async(req, res) => {
    try {
        const count = await ToySchema.countDocuments({});
        res.status(200).json({ count });
    } catch (err) {
        res.status(502).json(err);
    }
})

router.get('/single/:id', async(req, res, next) => {
    let id = req.params.id;

    if (!validator.isMongoId(id)) {
        next();
        return;
    }
    try {
        const data = await ToySchema.findOne({ _id: id });
        if (!data) {
            res.status(404).json({ msg: "Toy not found" });
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(502).json(err);
    }
});

router.get('/:category?', async(req, res, next) => {
    try {
        let category = req.params.category;
        const perPage = req.query.perPage ? Math.min(req.query.perPage, 10) : 10;
        const { name, info, min, max } = req.query;
        const query = {};
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
            $or: [query]
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
router.post('/', auth, async(req, res) => {
    const { error } = validateToy(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    try {
        let newToy = await new ToySchema(req.body);
        newToy.user_id = req.tokenData._id;
        await newToy.save();
        res.status(200).json(newToy);
    } catch (err) {
        res.status(502).json(err);
    }
})
router.put('/:id', auth, async(req, res) => {
    const { error } = validateToy(req.body);
    if (error) return res.status(400).json(error.details[0].message);

    try {
        const updated = await ToySchema.updateOne({ _id: req.params.id, user_id: req.tokenData._id }, req.body);

        if (updated.nModified == 0) {
            return res.status(401).json({ msg: "You can't edit this toy" });
        }

        res.json(updated);
    } catch (err) {
        res.status(502).json(err);
    }
});

router.delete('/:id', auth, async(req, res) => {
    try {
        const deleted = await ToySchema.deleteOne({ _id: req.params.id, user_id: req.tokenData._id });

        if (deleted.deletedCount == 0) {
            return res.status(401).json({ msg: "You can't delete this toy" });
        }

        res.json(deleted);
    } catch (err) {
        res.status(502).json(err);
    }
});


module.exports = router;