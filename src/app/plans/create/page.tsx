"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPlan } from "@/services/plans";
import { getSession } from "@/services/session";

type FormErrors = {
  name?: string;
  address?: string;
  estimatedPrice?: string;
  estimatedTime?: string;
  description?: string;
};

const DESCRIPTION_MAX = 600;

export default function CreatePlanPage() {
  const router = useRouter();
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [description, setDescription] = useState("");
  const [recomendations, setRecomendations] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const newErrors: FormErrors = {};

    if (name.trim().length < 2 || name.trim().length > 50) {
      newErrors.name = "El nombre debe tener entre 2 y 50 caracteres";
    }

    if (address.trim().length === 0) {
      newErrors.address = "La dirección es obligatoria";
    }

    const priceNumber = Number(estimatedPrice);
    if (!estimatedPrice || isNaN(priceNumber) || priceNumber <= 0) {
      newErrors.estimatedPrice = "El precio estimado debe ser mayor a 0";
    }

    const timeNumber = Number(estimatedTime);
    if (
      !estimatedTime ||
      isNaN(timeNumber) ||
      !Number.isInteger(timeNumber) ||
      timeNumber <= 0
    ) {
      newErrors.estimatedTime = "La duración debe ser un número entero";
    }

    if (description.trim().length === 0) {
      newErrors.description = "La descripción es obligatoria";
    } else if (description.length >= DESCRIPTION_MAX) {
      newErrors.description = `La descripción debe tener menos de ${DESCRIPTION_MAX} caracteres`;
    }
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");
    const session = getSession();
    if (!session.id) {
      router.push("/auth/login");
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createPlan({
        name: name.trim(),
        description: description.trim(),
        estimatedPrice: Number(estimatedPrice),
        estimatedTime: Number(estimatedTime),
        recomendations: recomendations.trim() || undefined,
        address: address.trim(),
        image: image.trim() || undefined,
        userId: session.id,
      });

      router.push("/plans");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo crear el plan"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex-1 bg-slate-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">
          Crear un nuevo plan
        </h1>
        <p className="text-slate-500 mt-1">
          Organiza, invita a tus amigos o abre plazas para que otros
          miembros se sumen a vivir momentos únicos.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-8 mt-8"
        >
          {/* Foto de portada */}
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-900">
              Foto de portada del plan
            </label>
          </div>

          <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center py-8 px-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M18 12h.008v.008H18V12Zm-12 9h12a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6a2.25 2.25 0 0 0-2.25 2.25v12A2.25 2.25 0 0 0 6 21Z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-4 text-sm outline-none focus:border-blue-400"
            />
          </div>

          {/* Nombre del plan */}
          <div className="mt-6">
            <label className="font-semibold text-slate-900">
              Nombre del plan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-2 outline-none focus:border-blue-400"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Dirección */}
          <div className="mt-6">
            <label className="font-semibold text-slate-900">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-2 outline-none focus:border-blue-400"
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
            )}
          </div>

          {/* Precio y duración */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="font-semibold text-slate-900">
                Precio estimado <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                min={0}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-2 outline-none focus:border-blue-400"
              />
              {errors.estimatedPrice && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.estimatedPrice}
                </p>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-900">
                Duración (minutos) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                min={0}
                step={1}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-2 outline-none focus:border-blue-400"
              />
              {errors.estimatedTime && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.estimatedTime}
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-900">
                Descripción del plan <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-sm ${
                  description.length >= DESCRIPTION_MAX
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={DESCRIPTION_MAX}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-2 outline-none focus:border-blue-400 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Recomendaciones */}
          <div className="mt-6">
            <label className="font-semibold text-slate-900">
              Recomendaciones para los asistentes
            </label>
            <p className="text-sm text-slate-400 mt-0.5">
              Agrega tips clave.
            </p>
            <input
              type="text"
              value={recomendations}
              onChange={(e) => setRecomendations(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-2 outline-none focus:border-blue-400"
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 mt-4">{submitError}</p>
          )}
          <hr className="border-slate-200 mt-8" />
          <div className="flex justify-end gap-3 mt-6">
            <Link
              href="/plans"
              className="bg-slate-100 text-slate-600 font-semibold rounded-xl px-6 py-3 hover:bg-slate-200"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Publicando..." : "Publicar plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}