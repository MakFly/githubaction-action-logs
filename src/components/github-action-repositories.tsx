"use client";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Octokit } from "@octokit/rest";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LogoutButton from "@/app/dashboard/logout-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  // DialogOverlay,
  DialogTitle,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { Ban, BellOff, CheckCircle2, CircleX, Clock } from "lucide-react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";

type Workflow = {
  status: "en cours" | "completed" | "supprimé";
};

function Repositories({ session }) {
  const [selectedRepo, setSelectedRepo] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sorting, setSorting] = useState([]);
  const [allRepos, setAllRepos] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState({}); // État pour chaque workflow
  const pageSize = 15;
  const observerRef = useRef();

  const { isLoading: reposLoading } = useQuery({
    queryKey: ["repos"],
    queryFn: async () => {
      if (!session?.accessToken) return [];
      const octokit = new Octokit({ auth: session.accessToken });
      let allRepos = [];
      let page = 1;
      let fetchedRepos;

      do {
        const { data } = await octokit.repos.listForAuthenticatedUser({
          visibility: "all",
          per_page: pageSize,
          page,
        });
        fetchedRepos = data;
        allRepos = [...allRepos, ...fetchedRepos];
        page++;
      } while (fetchedRepos.length === pageSize);

      setAllRepos(allRepos); // Met à jour allRepos avec tous les dépôts
      return allRepos.slice(0, pageSize); // Retourne uniquement les premiers éléments pour l'affichage initial
    },
    enabled: !!session?.accessToken,
  });

  const filteredRepos = useMemo(() => {
    const searchedRepos = allRepos.filter((repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return searchedRepos.slice(
      pageIndex * pageSize,
      (pageIndex + 1) * pageSize
    ); // Ne retourne que les éléments de la page actuelle
  }, [allRepos, searchTerm, pageIndex, pageSize]);

  const {
    data: workflowPages,
    isLoading: workflowsLoading,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["workflows", selectedRepo],
    queryFn: async ({ pageParam = 1 }) => {
      if (!session?.accessToken || !selectedRepo) return [];
      const [owner, repo] = selectedRepo.split("/");
      const octokit = new Octokit({ auth: session.accessToken });
      const { data } = await octokit.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: pageSize,
        page: pageParam,
      });
      return data.workflow_runs;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === pageSize ? allPages.length + 1 : undefined,
    enabled: !!session?.accessToken && !!selectedRepo,
  });

  const repoColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Nom", sortable: true },
      { accessorKey: "owner.login", header: "Propriétaire" },
      {
        id: "actions",
        header: "Workflows",
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setSelectedRepo(row.original.full_name);
              setIsDialogOpen(true);
            }}
          >
            Voir les workflows
          </Button>
        ),
      },
    ],
    []
  );

  // Fonction pour télécharger les logs
  const fetchWorkflowLogs = useCallback(
    async (workflowId, logsUrl) => {
      if (!session?.accessToken) return;

      setLoadingLogs((prev) => ({ ...prev, [workflowId]: true })); // Active le loader pour un workflow spécifique

      const octokit = new Octokit({ auth: session.accessToken });
      try {
        const response = await octokit.request(`GET ${logsUrl}`, {
          owner: selectedRepo.split("/")[0],
          repo: selectedRepo.split("/")[1],
          run_id: workflowId,
        });

        const blob = new Blob([response.data], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `workflow_logs_${workflowId}.zip`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error("Erreur lors du téléchargement des logs :", error);
      } finally {
        setLoadingLogs((prev) => ({ ...prev, [workflowId]: false })); // Désactive le loader pour ce workflow
      }
    },
    [session?.accessToken, selectedRepo]
  );

  const getStatusIcon = (status: Workflow["status"]) => {
    switch (status) {
      case "en cours":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <Ban className="h-4 w-4 text-yellow-500" />;
      case "failure":
        return <CircleX className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "skipped":
        return <BellOff className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Workflow["status"]) => {
    // Appliquer une transformation ou traduction des statuts ici
    switch (status) {
      case "in_progress": // API retourne "in_progress"
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            En cours
          </Badge>
        );
      case "cancelled": // API retourne "in_progress"
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Annulé
          </Badge>
        );
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Terminé
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Terminé
          </Badge>
        );
      case "failure":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Échec
          </Badge>
        );
      case "skipped":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Ignoré
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inconnu
          </Badge>
        );
    }
  };

  const workflowColumns = useMemo(
    () => [
      { accessorKey: "name", header: "Nom du Workflow" },
      { accessorKey: "display_title", header: "Titre" },
      {
        accessorKey: "status",
        header: "Statut",
      },
      { accessorKey: "conclusion", header: "Conclusion" },
      { accessorKey: "head_branch", header: "Branche" },
      {
        accessorKey: "created_at",
        header: "Créé le",
      },
      {
        accessorKey: "updated_at",
        header: "Mis à jour le",
      },
      {
        id: "actions",
        header: "Logs Workflows",
        cell: ({ row }) => (
          <div className="relative flex justify-center items-center h-full">
            {loadingLogs[row.original.id] ? (
              <Spinner />
            ) : (
              <Button
                onClick={() =>
                  fetchWorkflowLogs(row.original.id, row.original.logs_url)
                }
                className="dark:bg-white font-bold"
              >
                Télécharger les logs du workflow
              </Button>
            )}
          </div>
        ),
      },
    ],
    [fetchWorkflowLogs, loadingLogs]
  );

  const repoTable = useReactTable({
    data: filteredRepos,
    columns: repoColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(
      allRepos.filter((repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).length / pageSize
    ),
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onSortingChange: setSorting,
  });

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage]
  );

  useEffect(() => {
    const element = observerRef.current;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    });

    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  if (!session) {
    return (
      <Card className="w-[350px] mx-auto mt-20">
        <CardHeader>
          <CardTitle>Accès refusé</CardTitle>
          <CardDescription>
            Vous devez vous connecter pour accéder à cette page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoutButton />
        </CardContent>
      </Card>
    );
  }

  if (reposLoading) {
    return (
      <Card className="w-[350px] mx-auto mt-20">
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
          <CardDescription>
            Veuillez patienter pendant que nous chargeons vos informations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord GitHub Actions</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>Bienvenue, {session?.user?.name}</span>
            <LogoutButton />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Rechercher par nom de dépôt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 font-bold"
          />
          <table className="table-auto w-full border">
            <thead>
              {repoTable.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 border"
                      onClick={() => {
                        if (header.column.getCanSort()) {
                          setSorting((prevSorting) => [
                            {
                              id: header.column.id,
                              desc: !prevSorting[0]?.desc,
                            },
                          ]);
                        }
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <span>
                          {sorting[0]?.id === header.column.id
                            ? sorting[0].desc
                              ? " 🔽"
                              : " 🔼"
                            : ""}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {repoTable.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-100 cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 border">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
              disabled={pageIndex === 0}
            >
              Précédent
            </Button>
            <Button onClick={() => setPageIndex(pageIndex + 1)}>Suivant</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* <DialogOverlay /> */}
        <DialogContent className="max-w-[90vw] md:max-w-[800px] lg:max-w-[1444px] p-4 rounded-lg overflow-y-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Workflows pour {selectedRepo}</DialogTitle>
          </DialogHeader>
          {workflowsLoading && <p>Chargement des workflows...</p>}
          <Table>
            <TableHeader>
              <TableRow>
                {workflowColumns.map((column) => (
                  <TableHead key={column.accessorKey || column.id}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflowPages?.pages.map((page) =>
                page.map((workflow) => (
                  <TableRow key={workflow.id}>
                    {workflowColumns.map((column) => (
                      <TableCell key={column.accessorKey || column.id}>
                        {column.accessorKey ? (
                          column.accessorKey === "status" ? (
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(workflow[column.accessorKey])}
                              {getStatusBadge(workflow[column.accessorKey])}
                            </div>
                          ) : column.accessorKey === "conclusion" ? (
                            workflow[column.accessorKey] === "success" ? (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(workflow[column.accessorKey])}
                                {getStatusBadge(workflow[column.accessorKey])}
                              </div>
                            ) : workflow[column.accessorKey] === "failure" ? (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(workflow[column.accessorKey])}
                                {getStatusBadge(workflow[column.accessorKey])}
                              </div>
                            ) : workflow[column.accessorKey] === "cancelled" ? (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(workflow[column.accessorKey])}
                                {getStatusBadge(workflow[column.accessorKey])}
                              </div>
                            ) : workflow[column.accessorKey] === "skipped" ? (
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(workflow[column.accessorKey])}
                                {getStatusBadge(workflow[column.accessorKey])}
                              </div>
                            ) : (
                              workflow[column.accessorKey]
                            )
                          ) : column.accessorKey === "created_at" ? (
                            new Date(
                              workflow[column.accessorKey]
                            ).toLocaleString()
                          ) : column.accessorKey === "updated_at" ? (
                            new Date(
                              workflow[column.accessorKey]
                            ).toLocaleString()
                          ) : (
                            workflow[column.accessorKey]
                          )
                        ) : (
                          column.cell({ row: { original: workflow } })
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div ref={observerRef} className="h-4"></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const queryClient = new QueryClient();

export default function GithubActionRepositories({ token }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Repositories session={token} />
    </QueryClientProvider>
  );
}
