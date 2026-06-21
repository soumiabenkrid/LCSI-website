"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Newspaper,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import CreateNewsDialog from "@/components/CreateNewsDialog";
import EditNewsDialog from "@/components/EditNewsDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { getContentTypeColor } from "@/lib/contentColors";

type ContentType =
  | "NEWS"
  | "SEMINAR"
  | "WORKSHOP"
  | "CONFERENCE"
  | "SYMPOSIUM"
  | "FORUM"
  | "CELEBRATION";

type News = {
  id: string;
  slug: string;
  type: ContentType;
  image?: string;
  publishedAt?: string;
  eventDate?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  translations: Array<{
    id: string;
    language: "FR" | "EN";
    title: string;
    description: string;
    categoryLabel?: string;
    categoryColor?: string;
  }>;
};

const CONTENT_TYPES = [
  { value: "NEWS", label: "Actualité" },
  { value: "SEMINAR", label: "Séminaire" },
  { value: "WORKSHOP", label: "Atelier" },
  { value: "CONFERENCE", label: "Conférence" },
  { value: "SYMPOSIUM", label: "Symposium" },
  { value: "FORUM", label: "Forum" },
  { value: "CELEBRATION", label: "Célébration" },
];

export default function NewsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserMemberId, setCurrentUserMemberId] = useState<string | null>(
    null
  );

  const userRole = user?.role || "MEMBER";
  const isAdmin = userRole === "ADMIN";

  // États pour l'édition/suppression
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Récupérer l'ID du profil membre de l'utilisateur
  useEffect(() => {
    async function fetchUserMemberId() {
      if (!user?.email) return;

      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setCurrentUserMemberId(data.id);
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du profil utilisateur:",
          error
        );
      }
    }

    async function initializeUserAndNews() {
      await fetchUserMemberId();
    }
    initializeUserAndNews();
  }, [user]);

  // Charger les actualités
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contents");
      if (response.ok) {
        const data = await response.json();

        // Récupérer les détails complets avec createdById
        const newsWithDetails = await Promise.all(
          data.contents.map(async (item: any) => {
            const detailResponse = await fetch(`/api/contents/${item.id}`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return detailData.content;
            }
            return item;
          })
        );

        setNews(newsWithDetails);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Vérifier si l'utilisateur peut modifier/supprimer une actualité
  const canUserModifyNews = (newsItem: News): boolean => {
    if (isAdmin) return true;
    return newsItem.createdById === currentUserMemberId;
  };

  // Filtrer les actualités
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      // Filtre par type
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
        return false;
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        // FIX 1: Protection de la recherche contre un tableau de translations inexistant
        const translations = item.translations || [];
        const frTranslation = translations.find((t) => t.language === "FR");
        const enTranslation = translations.find((t) => t.language === "EN");

        const matchTitle =
          frTranslation?.title?.toLowerCase().includes(query) ||
          enTranslation?.title?.toLowerCase().includes(query);
        const matchDescription =
          frTranslation?.description?.toLowerCase().includes(query) ||
          enTranslation?.description?.toLowerCase().includes(query);

        return matchTitle || matchDescription;
      }

      return true;
    });
  }, [news, selectedTypes, searchQuery]);

  // Basculer la sélection d'un type
  const toggleType = (type: ContentType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Gestion de l'édition
  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setShowEditDialog(true);
  };

  // Gestion de la suppression
  const handleDelete = (newsItem: News) => {
    setDeletingNews(newsItem);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingNews) return;

    try {
      const response = await fetch(`/api/contents/${deletingNews.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchNews();
        setShowDeleteDialog(false);
        setDeletingNews(null);
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'actualité");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-mainBlue" />
        <span className="ml-2 text-lightgrayTxt">
          Chargement des actualités...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF flex items-center gap-2">
            <Newspaper size={28} />
            Gestion des Actualités
          </h1>
          <p className="text-lightgrayTxt">
            {isAdmin
              ? "Gérez toutes les actualités du laboratoire"
              : "Créez et gérez vos actualités"}
          </p>
        </div>
        <CreateNewsDialog onNewsCreated={fetchNews} />
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-grayBorder space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lightgrayTxt"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher une actualité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-grayBorder rounded-lg focus:ring-2 focus:ring-mainBlue focus:border-mainBlue"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-mainBlue text-white border-mainBlue"
                : "bg-white text-darkgrayTxt border-grayBorder hover:bg-grayRectangle"
            }`}
          >
            <Filter size={20} />
            Filtres
            {selectedTypes.length > 0 && (
              <span className="px-2 py-0.5 bg-white text-mainBlue text-xs rounded-full font-semibold">
                {selectedTypes.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtres par type */}
        {showFilters && (
          <div className="pt-4 border-t border-grayBorder">
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value as ContentType)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTypes.includes(type.value as ContentType)
                      ? "bg-mainBlue text-white"
                      : "bg-grayRectangle text-darkgrayTxt hover:bg-gray-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {selectedTypes.length > 0 && (
              <button
                onClick={() => setSelectedTypes([])}
                className="mt-2 text-sm text-mainBlue hover:underline"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-grayBorder">
          <div className="text-sm text-lightgrayTxt">Total</div>
          <div className="text-2xl font-bold text-darkgrayTxt">
            {news.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-grayBorder">
          <div className="text-sm text-lightgrayTxt">Résultats filtrés</div>
          <div className="text-2xl font-bold text-mainBlue">
            {filteredNews.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-grayBorder">
          <div className="text-sm text-lightgrayTxt">
            {isAdmin ? "Vos actualités" : "Créées par vous"}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {news.filter((n) => n.createdById === currentUserMemberId).length}
          </div>
        </div>
      </div>

      {/* Liste des actualités */}
      <div className="bg-white rounded-lg shadow-sm border border-grayBorder overflow-hidden">
        {filteredNews.length === 0 ? (
          <div className="p-12 text-center">
            <Newspaper size={48} className="mx-auto text-lightgrayTxt mb-4" />
            <h3 className="text-lg font-semibold text-darkgrayTxt mb-2">
              Aucune actualité trouvée
            </h3>
            <p className="text-lightgrayTxt">
              {searchQuery || selectedTypes.length > 0
                ? "Essayez de modifier vos critères de recherche"
                : "Commencez par créer votre première actualité"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-grayBorder">
            {filteredNews.map((item) => {
              // FIX 2: Option chaining & array fallback to completely bypass missing translation arrays
              const frTranslation = item.translations?.find(
                (t) => t.language === "FR"
              );
              const canModify = canUserModifyNews(item);

              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-grayRectangle transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    {item.image && (
                      <div className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={frTranslation?.title || "Image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Type et catégorie */}
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{
                                backgroundColor: getContentTypeColor(item.type),
                              }}
                            >
                              {CONTENT_TYPES.find((t) => t.value === item.type)
                                ?.label || item.type}
                            </span>
                            {frTranslation?.categoryLabel && (
                              <span className="text-xs text-lightgrayTxt">
                                • {frTranslation.categoryLabel}
                              </span>
                            )}
                          </div>

                          {/* Titre */}
                          <h3 className="text-lg font-semibold text-darkgrayTxt mb-2">
                            {frTranslation?.title || "Sans titre"}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-lightgrayTxt line-clamp-2 mb-3">
                            {frTranslation?.description || ""}
                          </p>

                          {/* Dates */}
                          <div className="flex items-center gap-4 text-xs text-lightgrayTxt">
                            {item.publishedAt && (
                              <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                Publié le{" "}
                                {new Date(item.publishedAt).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </div>
                            )}
                            {item.eventDate && (
                              <div className="flex items-center gap-1">
                                <Tag size={14} />
                                Événement le{" "}
                                {new Date(item.eventDate).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {canModify && (
                            <>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditNewsDialog
        isOpen={showEditDialog}
        news={editingNews}
        onClose={() => {
          setShowEditDialog(false);
          setEditingNews(null);
        }}
        onNewsUpdated={fetchNews}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        title="Supprimer l'actualité"
        message="Êtes-vous sûr de vouloir supprimer cette actualité ?"
        itemName={
          deletingNews?.translations?.find((t) => t.language === "FR")?.title || ""
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeletingNews(null);
        }}
      />
    </div>
  );
}