"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Newspaper,
  Calendar,
  Tag,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import ImageUpload from "./ui/ImageUpload";
import { getContentTypeColor } from "@/lib/contentColors";

interface CreateNewsDialogProps {
  onNewsCreated?: (news: any) => void;
}

interface NewsFormData {
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  slug: string;
  type: string;
  image: string;
  publishedAt: string;
  eventDate: string;
  categoryLabel_fr: string;
  categoryLabel_en: string;
}

const CONTENT_TYPES = [
  { value: "NEWS", label: "Actualité" },
  { value: "SEMINAR", label: "Séminaire" },
  { value: "WORKSHOP", label: "Atelier" },
  { value: "CONFERENCE", label: "Conférence" },
  { value: "SYMPOSIUM", label: "Symposium" },
  { value: "FORUM", label: "Forum" },
  { value: "CELEBRATION", label: "Célébration" },
];

export default function CreateNewsDialog({
  onNewsCreated,
}: CreateNewsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState<NewsFormData>({
    title_fr: "",
    title_en: "",
    description_fr: "",
    description_en: "",
    slug: "",
    type: "NEWS",
    image: "",
    publishedAt: new Date().toISOString().split("T")[0],
    eventDate: "",
    categoryLabel_fr: "",
    categoryLabel_en: "",
  });

  const handleInputChange = (field: keyof NewsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-générer le slug à partir du titre français
    if (field === "title_fr" && value) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_en: "",
      description_fr: "",
      description_en: "",
      slug: "",
      type: "NEWS",
      image: "",
      publishedAt: new Date().toISOString().split("T")[0],
      eventDate: "",
      categoryLabel_fr: "",
      categoryLabel_en: "",
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.title_fr ||
      !formData.title_en ||
      !formData.description_fr ||
      !formData.description_en
    ) {
      setNotification({
        message:
          "Veuillez remplir tous les champs obligatoires (titres et descriptions)",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const categoryColor = getContentTypeColor(formData.type);

      const response = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug,
          type: formData.type,
          image: formData.image || null,
          publishedAt: formData.publishedAt || null,
          eventDate: formData.eventDate || null,
          translations: [
            {
              language: "FR",
              title: formData.title_fr,
              description: formData.description_fr,
              categoryLabel: formData.categoryLabel_fr || null,
              categoryColor: categoryColor,
            },
            {
              language: "EN",
              title: formData.title_en,
              description: formData.description_en,
              categoryLabel: formData.categoryLabel_en || null,
              categoryColor: categoryColor,
            },
          ],
        }),
      });

      // 🌟 SÉCURISATION DU PARSING JSON : Évite le crash "unexpected end of data"
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};

      if (response.ok) {
        setNotification({
          message: "Actualité créée avec succès !",
          type: "success",
        });
        resetForm();
        onNewsCreated?.(data.content);
        setTimeout(() => {
          setOpen(false);
          setNotification(null);
        }, 1500);
      } else {
        console.error(`🚨 Erreur Serveur (${response.status}):`, data);
        setNotification({
          message: data.error || data.details || `Erreur serveur (${response.status})`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error creating news:", error);
      setNotification({
        message: "Erreur réseau lors de la création de l'actualité",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
      >
        <Plus size={20} />
        Nouvelle Actualité
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-6 border-b border-grayBorder flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Newspaper className="text-mainBlue" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-darkgrayTxt">
                  Créer une actualité
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 hover:bg-grayRectangle rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Notification */}
              {notification && (
                <div
                  className={`p-4 rounded-lg border ${
                    notification.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {notification.message}
                </div>
              )}

              {/* Type et Catégorie */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                >
                  {CONTENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                  placeholder="mon-actualite-2025"
                />
                <p className="text-xs text-lightgrayTxt mt-1">
                  Généré automatiquement à partir du titre français
                </p>
              </div>

              {/* Titres */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Titre (Français) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_fr}
                    onChange={(e) =>
                      handleInputChange("title_fr", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                    placeholder="Titre de l'actualité"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Titre (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) =>
                      handleInputChange("title_en", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                    placeholder="News title"
                  />
                </div>
              </div>

              {/* Labels de catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Label catégorie (Français)
                  </label>
                  <input
                    type="text"
                    value={formData.categoryLabel_fr}
                    onChange={(e) =>
                      handleInputChange("categoryLabel_fr", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                    placeholder="Ex: Événement Important"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Label catégorie (English)
                  </label>
                  <input
                    type="text"
                    value={formData.categoryLabel_en}
                    onChange={(e) =>
                      handleInputChange("categoryLabel_en", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                    placeholder="Ex: Important Event"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Description (Français) *
                  </label>
                  <textarea
                    value={formData.description_fr}
                    onChange={(e) =>
                      handleInputChange("description_fr", e.target.value)
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue resize-none"
                    placeholder="Décrivez l'actualité en français..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    Description (English) *
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) =>
                      handleInputChange("description_en", e.target.value)
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue resize-none"
                    placeholder="Describe the news in English..."
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date de publication
                  </label>
                  <input
                    type="date"
                    value={formData.publishedAt}
                    onChange={(e) =>
                      handleInputChange("publishedAt", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date de l'événement (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      handleInputChange("eventDate", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  <ImageIcon size={16} className="inline mr-1" />
                  Image de couverture
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => handleInputChange("image", url)}
                  placeholder="Sélectionner une image pour l'actualité"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white p-6 border-t border-grayBorder flex items-center justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-6 py-2 border border-grayBorder rounded-lg hover:bg-grayRectangle transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Créer l'actualité
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}