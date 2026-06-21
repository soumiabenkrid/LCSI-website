"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Users,
  BookOpen,
  Eye,
  Edit,
  Building,
  Target,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { useTeams } from "@/hooks/useTeams";
import CreateTeamDialog from "@/components/CreateTeamDialog";
import ProtectedAction from "@/components/ProtectedAction";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Use teams API hook
  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams,
  } = useTeams("FR");

  const teams = teamsData?.teams || [];

  // Filter teams by search
  const filteredTeams = teams.filter((team) => {
    const searchLower = searchQuery.toLowerCase();

    return (
      (team.name || "").toLowerCase().includes(searchLower) ||
      (team.description || "").toLowerCase().includes(searchLower) ||
      team.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleMembersUpdated = () => {
    refetchTeams();
  };

  const getTeamColor = (slug: string) => {
    const colors = {
      ATLAS: "bg-blue-100 text-blue-800 border-blue-200",
      ACTAL: "bg-green-100 text-green-800 border-green-200",
      PRINT: "bg-purple-100 text-purple-800 border-purple-200",
      MA: "bg-orange-100 text-orange-800 border-orange-200",
      IDEAS: "bg-orange-100 text-orange-800 border-pink-200",
    };
    return (
      colors[slug as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  if (teamsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
          Gestion des Equipes
        </h1>
        <ErrorMessage error={teamsError} onRetry={refetchTeams} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed bottom-6 right-6 rounded-lg shadow-lg text-white z-50 ${
            notification.type === "success"
              ? "bg-green-500  px-6 py-4"
              : "bg-red-500  px-6 py-4"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Gestion des Equipes
          </h1>
          {!teamsLoading && (
            <p className="text-lightgrayTxt">
              {filteredTeams.length} équipe{filteredTeams.length > 1 ? "s" : ""}{" "}
              trouvée{filteredTeams.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ProtectedAction action="createTeams">
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-mainBlue text-white rounded-lg hover:bg-mainBlue/90 transition-colors"
            >
              <Plus size={20} />
              <span>Nouvelle équipe</span>
            </button>
          </ProtectedAction>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg p-6 border border-grayBorder">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lightgrayTxt"
            size={20}
          />
          <input
            type="text"
            placeholder="Rechercher par nom, description ou mots-clés..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {teamsLoading && <LoadingSpinner />}

      {/* Teams Grid */}
      {!teamsLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className={`bg-white rounded-lg border-2 ${getTeamColor(
                team.slug
              )} overflow-hidden hover:shadow-lg transition-shadow`}
            >
              {/* Team Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {team.image && (team.image.startsWith("/") || team.image.startsWith("http")) ? (
                      <img
                        src={team.image}
                        alt={team.name || "Team"}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg border uppercase ${getTeamColor(
                          team.slug
                        )}`}
                      >
                        {(team.name || "T").charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-darkgrayTxt">
                        {team.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getTeamColor(
                          team.slug
                        )}`}
                      >
                        {team.slug}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {team.description && (
                  <p className="text-sm text-lightgrayTxt mb-4 line-clamp-3">
                    {team.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-lightgrayTxt">Membres</p>
                      <p className="font-semibold text-darkgrayTxt">
                        {team.membersCount || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen size={16} className="text-green-600" />
                    <div>
                      <p className="text-sm text-lightgrayTxt">Publications</p>
                      <p className="font-semibold text-darkgrayTxt">
                        {team.publicationsCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                {team.keywords && team.keywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-1 mb-2">
                      <Lightbulb size={14} className="text-yellow-600" />
                      <span className="text-xs font-medium text-darkgrayTxt">
                        Mots-clés
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {team.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {team.keywords.length > 3 && (
                        <span className="text-xs text-lightgrayTxt">
                          +{team.keywords.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Domains */}
                {team.domains && team.domains.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-1 mb-2">
                      <Target size={14} className="text-red-600" />
                      <span className="text-xs font-medium text-darkgrayTxt">
                        Domaines
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {team.domains.slice(0, 2).map((domain, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full"
                        >
                          {domain}
                        </span>
                      ))}
                      {team.domains.length > 2 && (
                        <span className="text-xs text-lightgrayTxt">
                          +{team.domains.length - 2} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/dash/teams/${team.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={16} />
                    <span>Détails</span>
                  </Link>
                  <ProtectedAction action="editTeamInfo">
                    <Link
                      href={`/dash/teams/${team.id}?edit=true`}
                      className="flex items-center justify-center w-10 h-10 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                      title="Modifier l'équipe"
                    >
                      <Edit size={16} />
                    </Link>
                  </ProtectedAction>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Empty State */}
      {!teamsLoading && filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-lightgrayTxt" />
          <h3 className="mt-2 text-sm font-medium text-darkgrayTxt">
            Aucune équipe trouvée
          </h3>
          <p className="mt-1 text-sm text-lightgrayTxt">
            {searchQuery
              ? "Essayez de modifier vos critères de recherche."
              : "Commencez par créer une nouvelle équipe."}
          </p>
        </div>
      )}

      {/* Create Team Dialog */}
      <CreateTeamDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onTeamCreated={handleMembersUpdated}
      />
    </div>
  );
}