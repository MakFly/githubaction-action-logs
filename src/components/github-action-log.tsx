"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock,
  Trash2,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Workflow = {
  id: string;
  name: string;
  status: "en cours" | "terminé" | "supprimé";
  timestamp: string;
};

// Simulated API call
const fetchWorkflows = async (): Promise<Workflow[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  return [
    {
      id: "1",
      name: "Build and Test",
      status: "en cours",
      timestamp: "2023-11-04 10:30",
    },
    {
      id: "2",
      name: "Deploy to Production",
      status: "terminé",
      timestamp: "2023-11-04 09:45",
    },
    {
      id: "3",
      name: "Lint Code",
      status: "supprimé",
      timestamp: "2023-11-04 08:15",
    },
    {
      id: "4",
      name: "Run Integration Tests",
      status: "en cours",
      timestamp: "2023-11-04 11:00",
    },
    {
      id: "5",
      name: "Generate Documentation",
      status: "terminé",
      timestamp: "2023-11-04 07:30",
    },
  ];
};

const getStatusIcon = (status: Workflow["status"]) => {
  switch (status) {
    case "en cours":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "terminé":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "supprimé":
      return <Trash2 className="h-4 w-4 text-red-500" />;
  }
};

const getStatusBadge = (status: Workflow["status"]) => {
  switch (status) {
    case "en cours":
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          En cours
        </Badge>
      );
    case "terminé":
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Terminé
        </Badge>
      );
    case "supprimé":
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Supprimé
        </Badge>
      );
  }
};

function GitHubActionsLog() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Workflow["status"] | "all">(
    "all"
  );

  const {
    data: workflows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workflows"],
    queryFn: fetchWorkflows,
  });

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as Workflow["status"];
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            {getStatusBadge(status)}
          </div>
        );
      },
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Horodatage
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("timestamp")}</div>,
    },
  ];

  const table = useReactTable({
    data: workflows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return value
        ?.toString()
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
    state: {
      globalFilter,
    },
  });

  if (isLoading) return <div>Chargement des workflows...</div>;
  if (isError) return <div>Erreur lors du chargement des workflows</div>;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">GitHub Actions Log</h1>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher des workflows..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as Workflow["status"] | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="en cours">En cours</SelectItem>
            <SelectItem value="terminé">Terminés</SelectItem>
            <SelectItem value="supprimé">Supprimés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}

// Create a client
const queryClient = new QueryClient();

// Wrap everything in QueryClientProvider
export default function GithubActionWorkflowsLog() {
  return (
    <QueryClientProvider client={queryClient}>
      <GitHubActionsLog />
    </QueryClientProvider>
  );
}
