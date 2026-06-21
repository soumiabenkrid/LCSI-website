"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Eye,
  Users,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Gender, MemberPosition, UserRole } from "@/generated/prisma";

import { useMembers } from "@/hooks/useMembers";
import { useTeams } from "@/hooks/useTeams";
import type { Member } from "@/lib/api";
import ProtectedAction from "@/components/ProtectedAction";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUserPosition, setNewUserPosition] = useState<MemberPosition>(
    MemberPosition.ASSOCIATE_PROFESSOR,
  );
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.MEMBER);
  const [newUserGender, setNewUserGender] = useState<Gender>(Gender.MALE);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
    deleteMember,
  } = useMembers({
    search: searchQuery,
    teams: selectedTeams.length > 0 ? selectedTeams : undefined,
    language: "FR",
  });

  const {
    data: teamsData,
    loading: teamsLoading,
    error: teamsError,
  } = useTeams("FR");

  const members = membersData?.members || [];
  const teams = teamsData?.teams || [];

  const resetCreateForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setConfirmPassword("");
    setNewUserPosition(MemberPosition.ASSOCIATE_PROFESSOR);
    setNewUserRole(UserRole.MEMBER);
    setNewUserGender(Gender.MALE);
    setCreateError(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);
	
	
    if (!newUserEmail.toLowerCase().endsWith("@esi.dz")) {
      setCreateError("Seuls les emails @esi.dz sont autorisés");
      return;
    }

    if (newUserPassword !== confirmPassword) {
      setCreateError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setIsCreating(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          position: newUserPosition,
          role: newUserRole,
          gender: newUserGender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.error || "Erreur lors de la création du compte");
        return;
      }

      setCreateSuccess("Compte créé avec succès.");
      setShowCreateModal(false);
      resetCreateForm();
      await refetchMembers();
    } catch (error) {
      console.error("Erreur lors de la création du compte:", error);
      setCreateError("Erreur serveur lors de la création du compte");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      return;
    }

    try {
      setDeletingId(memberId);
      await deleteMember(memberId);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du membre");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTeamToggle = (teamSlug: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamSlug)
        ? prev.filter((t) => t !== teamSlug)
        : [...prev, teamSlug],
    );
  };

  const getAvatarFallback = (member: Member) => {
    const names = member.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return member.name.substring(0, 2).toUpperCase();
  };

  const getTeamOptions = () => {
    return [
      { value: "", label: "Toutes les équipes" },
      ...teams.map((team) => ({
        value: team.slug,
        label: team.name,
      })),
    ];
  };

  if (membersError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
          Membres
        </h1>
        <ErrorMessage error={membersError} onRetry={refetchMembers} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-darkgrayTxt font-integralCF">
            Membres
          </h1>
          {!membersLoading && (
            <p className="text-lightgrayTxt">
              {members.length} membre{members.length > 1 ? "s" : ""} trouvé
              {members.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <ProtectedAction action="createMembers">
            <button
              onClick={() => {
                setCreateError(null);
                setCreateSuccess(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-mainBlue px-4 py-3 text-white hover:bg-mainBlue/90 transition-colors"
            >
              <Plus size={18} />
              <span>Ajouter un membre</span>
            </button>
          </ProtectedAction>
        </div>
      </div>

      {createSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {createSuccess}
        </div>
      )}

      {/* Create Member Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-darkgrayTxt">
                  Ajouter un membre
                </h2>
                <p className="text-sm text-lightgrayTxt">
                  Création d'un compte utilisateur (profil membre à compléter
                  ensuite).
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="rounded p-1 text-lightgrayTxt hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="mb-4">
				  <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
					Is Member
				  </label>

				  <div className="flex items-center gap-2">
					<input
					  type="checkbox"
					  checked={isMember}
					  onChange={(e) => setIsMember(e.target.checked)}
					  className="h-4 w-4 rounded border-grayBorder text-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
					<span className="text-sm text-darkgrayTxt">
					  Activer si l’utilisateur est membre
					</span>
				  </div>
			</div>
			  <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nom et prénom"
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="etudiant@esi.dz"
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Position
                </label>
                <select
                  value={newUserPosition}
                  onChange={(e) =>
                    setNewUserPosition(e.target.value as MemberPosition)
                  }
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={MemberPosition.PROFESSOR}>Professeur</option>
                  <option value={MemberPosition.ASSOCIATE_PROFESSOR}>
                    Maître de conférences
                  </option>
                  <option value={MemberPosition.ASSISTANT_PROFESSOR}>
                    Professeur assistant
                  </option>
                  <option value={MemberPosition.LECTURER}>Enseignant</option>
                  <option value={MemberPosition.RESEARCHER}>Chercheur</option>
                  <option value={MemberPosition.PHD_STUDENT}>Doctorant</option>
                  <option value={MemberPosition.MASTER_STUDENT}>
                    Étudiant Master
                  </option>
                  <option value={MemberPosition.ENGINEER}>
                    Ingénieur de recherche
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Rôle
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={UserRole.MEMBER}>Member</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Genre
                </label>
                <select
                  value={newUserGender}
                  onChange={(e) => setNewUserGender(e.target.value as Gender)}
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={Gender.MALE}>Homme</option>
                  <option value={Gender.FEMALE}>Femme</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-darkgrayTxt">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-grayBorder px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="rounded-lg border border-grayBorder px-4 py-2 text-darkgrayTxt hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 rounded-lg bg-mainBlue px-4 py-2 text-white hover:bg-mainBlue/90 disabled:opacity-60"
                >
                  {isCreating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg p-6 border border-grayBorder">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lightgrayTxt"
              size={20}
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email, position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-grayBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bouton filtre */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilters || selectedTeams.length > 0
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-grayBorder text-darkgrayTxt hover:bg-grayRectangle"
            }`}
          >
            <Filter size={20} />
            <span>Filtres</span>
            {selectedTeams.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {selectedTeams.length}
              </span>
            )}
          </button>
        </div>

        {/* Filtres étendus */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-grayBorder">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtre par équipe */}
              <div>
                <label className="block text-sm font-medium text-darkgrayTxt mb-2">
                  Équipes
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {!teamsLoading &&
                    getTeamOptions()
                      .slice(1)
                      .map((team) => (
                        <label
                          key={team.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(team.value)}
                            onChange={() => handleTeamToggle(team.value)}
                            className="rounded border-grayBorder text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-darkgrayTxt">
                            {team.label}
                          </span>
                        </label>
                      ))}
                </div>
              </div>
            </div>

            {/* Reset filters */}
            {selectedTeams.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedTeams([])}
                  className="flex items-center space-x-2 text-sm text-lightgrayTxt hover:text-darkgrayTxt"
                >
                  <X size={16} />
                  <span>Réinitialiser les filtres</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {membersLoading && <LoadingSpinner />}

      {/* Table des membres */}
      {!membersLoading && (
        <div className="bg-white rounded-lg border border-grayBorder overflow-hidden">
          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4 p-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-grayRectangle rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold">
                        {getAvatarFallback(member)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-2">
                      <h3 className="font-medium text-darkgrayTxt truncate">
                        {member.name}
                      </h3>
                      {member.isTeamLeader && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 `}
                        >
                          Chef d'équipe
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-lightgrayTxt truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-lightgrayTxt">Position:</span>
                    <span className="text-sm text-darkgrayTxt">
                      {member.position}
                    </span>
                  </div>
                  {member.team && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-lightgrayTxt">Équipe:</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800`}
                      >
                        {member.teamName || member.team}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-lightgrayTxt">
                      Téléphone:
                    </span>
                    <span className="text-sm text-darkgrayTxt">
                      {member.phone || "Non renseigné"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-grayBorder">
                  <Link
                    href={`/dash/members/${member.id}`}
                    className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    title="Voir les détails"
                  >
                    <Eye size={16} />
                  </Link>
                  <ProtectedAction action="delete">
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={deletingId === member.id}
                      className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      {deletingId === member.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </ProtectedAction>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-grayRectangle">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Membre
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Position
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Équipe
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-darkgrayTxt">
                    Contact
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-darkgrayTxt">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grayBorder">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-grayRectangle/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 font-semibold text-sm">
                              {getAvatarFallback(member)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex gap-2">
                            <div className="font-medium text-darkgrayTxt">
                              {member.name}
                            </div>
                            {member.isTeamLeader && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 `}
                              >
                                Chef d'équipe
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-lightgrayTxt">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-darkgrayTxt">
                        {member.position}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {member.team && (
                        <span
                          className={`px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}
                        >
                          {member.teamName || member.team}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-lightgrayTxt">
                        {member.phone || "Non renseigné"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <Link
                          href={`/dash/members/${member.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </Link>
                        <ProtectedAction action="delete">
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={deletingId === member.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === member.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </ProtectedAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {members.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-lightgrayTxt" />
              <h3 className="mt-2 text-sm font-medium text-darkgrayTxt">
                Aucun membre trouvé
              </h3>
              <p className="mt-1 text-sm text-lightgrayTxt">
                {searchQuery || selectedTeams.length > 0
                  ? "Essayez de modifier vos critères de recherche."
                  : "Commencez par ajouter un nouveau membre."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
