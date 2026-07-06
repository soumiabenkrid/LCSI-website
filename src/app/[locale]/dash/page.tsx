"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  Settings,
} from "lucide-react";
import { usePermissions } from "@/contexts/PermissionsContext";

type Stats = {
  totalMembers: number;
  totalPublications: number;
  totalViews: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { canCreatePublications, canCreateTeams } = usePermissions();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/stats");
        
        if (response.ok) {
          // Read as text first to verify it's not empty before parsing
          const text = await response.text();
          const data = text ? JSON.parse(text) : null;
          
          if (data) {
            setStats(data);
          }
        } else {
          console.error(`API response error status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-grayBorder">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF mb-2">
            Bienvenue, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-lightgrayTxt">
            Voici un aperçu de l'activité du laboratoire LCSI aujourd'hui.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Membres */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-grayBorder">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-lightgrayTxt">
                Total Membres
              </p>
              <p className="text-3xl font-bold text-darkgrayTxt mt-2">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats?.totalMembers || 0
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-mainBlue" size={24} />
            </div>
          </div>
        </div>

        {/* Publications */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-grayBorder">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-lightgrayTxt">
                Publications
              </p>
              <p className="text-3xl font-bold text-darkgrayTxt mt-2">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  stats?.totalPublications || 0
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        {/* Vues totales */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-grayBorder">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-lightgrayTxt">
                Vues totales
              </p>
              <p className="text-3xl font-bold text-darkgrayTxt mt-2">
                {loading ? (
                  <span className="animate-pulse">--</span>
                ) : stats?.totalViews ? (
                  stats.totalViews.toLocaleString("fr-FR")
                ) : (
                  <span className="text-lg text-lightgrayTxt">
                    Bientôt disponible
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-grayBorder">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-darkgrayTxt">
              Actions rapides
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Publications - Admins seulement */}
            {canCreatePublications && (
              <button
                onClick={() => router.push(`/${locale}/dash/publications`)}
                className="flex flex-col items-center p-4 bg-mainBlue bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-200 group"
              >
                <BookOpen
                  className="text-white mb-2 group-hover:scale-110 transition-transform"
                  size={32}
                />
                <span className="text-sm font-medium text-white">
                  Publications
                </span>
              </button>
            )}

            {/* Équipes - Admins seulement */}
            {canCreateTeams && (
              <button
                onClick={() => router.push(`/${locale}/dash/teams`)}
                className="flex flex-col items-center p-4 bg-mainBlue bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-200 group"
              >
                <Plus
                  className="text-white mb-2 group-hover:scale-110 transition-transform"
                  size={32}
                />
                <span className="text-sm font-medium text-white">Equipes</span>
              </button>
            )}

            {/* Actualités - Admins seulement */}
            {canCreatePublications && (
              <button
                onClick={() => router.push(`/${locale}/dash/news`)}
                className="flex flex-col items-center p-4 bg-mainBlue bg-opacity-5 rounded-lg hover:bg-opacity-10 transition-all duration-200 group"
              >
                <Calendar
                  className="text-white mb-2 group-hover:scale-110 transition-transform"
                  size={32}
                />
                <span className="text-sm font-medium text-white">
                  Actualités
                </span>
              </button>
            )}

            {/* Paramètres - Tous (modifier son propre profil) */}
            <button
              onClick={() => router.push(`/${locale}/dash/settings`)}
              className="flex flex-col items-center p-4 bg-gray-100 bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all duration-200 group"
            >
              <Settings
                className="text-gray-600 mb-2 group-hover:scale-110 transition-transform"
                size={32}
              />
              <span className="text-sm font-medium text-gray-600">
                Mes Paramètres
              </span>
            </button>

            {/* Voir le Site - Tous */}
            <button
              onClick={() => router.push(`/${locale}`)}
              className="flex flex-col items-center p-4 bg-blue-100 bg-opacity-50 rounded-lg hover:bg-opacity-80 transition-all duration-200 group"
            >
              <Eye
                className="text-blue-600 mb-2 group-hover:scale-110 transition-transform"
                size={32}
              />
              <span className="text-sm font-medium text-blue-600">
                Voir le Site
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}