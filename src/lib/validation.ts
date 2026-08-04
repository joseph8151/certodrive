import { z } from "zod";
import { VEHICLE_CATEGORIES, SERVICE_TYPES } from "./constants";

export const bookingSchema = z.object({
  serviceType: z.enum(SERVICE_TYPES).default("AIRPORT_PICKUP"),
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]).default("ONE_WAY"),
  pickupCountry: z.string().min(1),
  pickupCity: z.string().min(1),
  pickupLocation: z.string().min(1),
  destination: z.string().min(1),
  serviceDate: z.string().min(1),
  serviceTime: z.string().min(1),
  returnDate: z.string().optional().nullable(),
  returnTime: z.string().optional().nullable(),
  flightNumber: z.string().optional().nullable(),
  passengers: z.coerce.number().int().min(1).max(60).default(1),
  adults: z.coerce.number().int().min(1).max(60).default(1),
  children: z.coerce.number().int().min(0).max(30).default(0),
  luggage: z.coerce.number().int().min(0).max(60).default(0),
  vehicleCategory: z.enum(VEHICLE_CATEGORIES),
  koreanDriverRequired: z.boolean().default(false),
  childSeat: z.boolean().default(false),
  airportPicket: z.boolean().default(false),
  hourlyDuration: z.coerce.number().int().min(1).max(24).optional().nullable(),
  specialRequest: z.string().max(2000).optional().nullable(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(3),
  messenger: z.string().optional().nullable(),
  promotionCode: z.string().optional().nullable(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const driverRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  partnerType: z.enum(["INDIVIDUAL", "COMPANY"]).default("INDIVIDUAL"),
  businessName: z.string().min(1),
  contactName: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  airports: z.array(z.string()).default([]),
  serviceRegions: z.array(z.string()).default([]),
  koreanLevel: z.string().default("NONE"),
  englishLevel: z.string().default("NONE"),
  bankAccount: z.string().optional().nullable(),
  settlementCurrency: z.string().default("USD"),
  baseSupplyPrice: z.coerce.number().optional().nullable(),
  vehicleCategory: z.string().min(1),
  maxPassengers: z.coerce.number().int().min(1).default(3),
  maxLuggage: z.coerce.number().int().min(0).default(2),
  termsAgreed: z.boolean().refine((v) => v, { message: "Terms must be agreed" }),
});
