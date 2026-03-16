import { model, models, Schema, Types, type Model } from "mongoose";

import Event from "./event.model";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type BookingModel = Model<IBooking>;

const bookingSchema = new Schema<IBooking, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: EMAIL_REGEX,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ eventId: 1 });

bookingSchema.pre("save", async function (next) {
  try {
    // Validate email format before persistence.
    if (!EMAIL_REGEX.test(this.email)) {
      throw new Error("Invalid email format.");
    }

    // Ensure each booking references a real event document.
    if (this.isModified("eventId")) {
      const eventExists = await Event.exists({ _id: this.eventId });
      if (!eventExists) {
        throw new Error("Referenced event does not exist.");
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Booking =
  (models.Booking as BookingModel) ||
  model<IBooking, BookingModel>("Booking", bookingSchema);
