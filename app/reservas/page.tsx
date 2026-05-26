"use client";

import { useState } from "react";
import Image from "next/image";
import StepIndicator from "@/components/reservations/StepIndicator";
import Step1Date from "@/components/reservations/Step1Date";
import Step2Time from "@/components/reservations/Step2Time";
import Step3Menu from "@/components/reservations/Step3Menu";
import Step4People from "@/components/reservations/Step4People";
import Step5Details from "@/components/reservations/Step5Details";

export interface ReservationState {
  date: string | null;
  timeSlotId: string | null;
  time: string | null;
  capacity: number;
  minPeople: number;
  maxPeople: number;
  depositPerPerson: number;
  menuId: string | null;
  menuName: string | null;
  menuPrice: number;
  numberOfPeople: number;
}

const initialState: ReservationState = {
  date: null,
  timeSlotId: null,
  time: null,
  capacity: 10,
  minPeople: 1,
  maxPeople: 4,
  depositPerPerson: 50,
  menuId: null,
  menuName: null,
  menuPrice: 0,
  numberOfPeople: 2,
};

export default function ReservasPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationState>(initialState);

  // Usar forma funcional de setState para evitar stale closure con menuPrice
  const handleStep1Complete = (date: string) => {
    setReservationData(prev => ({ ...prev, date }));
    setCurrentStep(2);
  };

  const handleStep2Complete = (timeSlotId: string, time: string, slotData: any) => {
    setReservationData(prev => ({
      ...prev,
      timeSlotId,
      time,
      minPeople: slotData.minPeople,
      maxPeople: slotData.maxPeople,
      depositPerPerson: slotData.depositPerPerson,
    }));
    setCurrentStep(3);
  };

  const handleStep3Complete = (menuId: string, menuName: string, menuPrice: number) => {
    setReservationData(prev => ({ ...prev, menuId, menuName, menuPrice }));
    setCurrentStep(4);
  };

  const handleStep4Complete = (numberOfPeople: number) => {
    setReservationData(prev => ({ ...prev, numberOfPeople }));
    setCurrentStep(5);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero con imagen */}
      <section className="relative h-[75vh] min-h-[520px] overflow-hidden">
        <Image
          src="/images/heroes/reservas.jpg"
          alt="Reservar mesa en Gunnen"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">Gunnen · A Coruña</p>
          <h1
            className="text-white uppercase tracking-[0.15em] font-light"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            Reservas
          </h1>
          <p className="text-white/75 mt-3 text-base font-light">
            Tres mesas · Experiencia única
          </p>
        </div>
      </section>

      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-base sm:text-lg text-gray-600">
              Complete el proceso de reserva en 5 sencillos pasos
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} />

          {/* Steps */}
          <div className="bg-white p-4 sm:p-8 md:p-12 mt-6 sm:mt-12">
            {currentStep === 1 && (
              <Step1Date onComplete={handleStep1Complete} />
            )}
            {currentStep === 2 && reservationData.date && (
              <Step2Time
                date={reservationData.date}
                onComplete={handleStep2Complete}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <Step3Menu
                onComplete={handleStep3Complete}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <Step4People
                minPeople={reservationData.minPeople}
                maxPeople={reservationData.maxPeople}
                initialPeople={reservationData.numberOfPeople}
                onComplete={handleStep4Complete}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && (
              <Step5Details
                reservationData={reservationData}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
