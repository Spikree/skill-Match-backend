import express from "express"
import verifyToken from "../../utils/verifyToken.js"
import Rating from "../../models/rating.js"

const review = express.Router();

review.post("/post/:userId", verifyToken, async (req,res) => {
    const {user} = req.user;
    const {rating, review} = req.body
    const {userId} = req.params;

    if(!user || !userId) {
        return res.status(400).json({
            message: "User or userId is missing"
        })
    }

    if(!rating || !review) {
        return res.status(400).json({
            message: "please provide a rating and a review"
        })
    }

    try {
        const UserRating = await Rating.create({
            reviewer: user._id,
            rating: rating,
            reviewOf: userId,
            review: review,
        })

        UserRating.save();

        return res.status(200).json({
            message: "Rating created successfully",
            UserRating
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: "Internal server error"
        })
    }
});

review.get("/getReviews/:userId", verifyToken, async (req,res) => {
    const {userId} = req.params;

    if(!userId) {
        return res.status(400).json({
            message: "userId is not provided"
        })
    }

    try {
        const reviews = await Rating.find({
            reviewOf: userId
        })

        if(reviews.length === 0 ) {
            return res.status(200).json({
                message: "No reviews on this user yet"
            })
        }

        return res.status(200).json({
            message: "Reviews fetched sucessfully",
            reviews
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: "Internal server error"
        })
    }
})

review.delete("/deleteReview/:reviewId", verifyToken, async (req, res) => {
    const { user } = req.user;
    const { reviewId } = req.params;

    if (!user) {
        return res.status(400).json({
            message: "User not provided"
        });
    }

    try {
        const review = await Rating.findOneAndDelete({
            reviewer: user._id,
            _id: reviewId
        });

        if (!review) {
            return res.status(404).json({
                message: "Review not found or you are not authorized to delete it"
            });
        }

        return res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

review.put("/edit/:reviewId", verifyToken, async(req,res) => {
    const {reviewId} = req.params
    const {user} = req.user;
    const {newRating, NewReview} = req.body

    if(!reviewId || !user) {
        return res.status(400).json({
            message: "Please provide reviewId and user"
        })
    }

    if (!newRating && !NewReview) {
        return res.status(400).json({
            message: "Please provide at least one field to update (rating or review)"
        });
    }

    try {
        const review = await Rating.findOne({
            _id: reviewId,
            reviewer: user._id
        })

        if(!review) {
            return res.status(404).json({
                message: "Review not found"
            })
        }

        if(newRating) {
            review.rating = newRating
        }

        if(NewReview) {
            review.review = NewReview
        }

        await review.save();

        return res.status(200).json({
            message: "Review updated successfully",
            updatedReview: review
        })

        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})


export default review;