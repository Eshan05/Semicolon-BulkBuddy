"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Credenza, CredenzaBody, CredenzaContent, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "@/components/ui/credenza";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Log = {
  id: string;
  createdAt: Date;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: string | null;
  actor: { id: string; email: string; name: string | null } | null;
};

function safePrettyJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function AuditLogView({ logs }: { logs: Log[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) => {
      const actor = l.actor?.email || l.actor?.name || "system";
      const entity = `${l.entityType}${l.entityId ? `:${l.entityId}` : ""}`;
      const haystack = `${l.action} ${actor} ${entity} ${l.metadata ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [logs, query]);

  return (
    <CardContent className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search action, actor, entity, metadata…"
            className="pl-9"
          />
        </div>
        <Badge variant="outline">{filtered.length} shown</Badge>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matching logs.</p>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[190px]">Time</TableHead>
                <TableHead className="w-[220px]">Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden lg:table-cell">Entity</TableHead>
                <TableHead className="w-[120px] text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => {
                const actorLabel = log.actor?.email || log.actor?.name || "system";
                const entity = `${log.entityType}${log.entityId ? `:${log.entityId}` : ""}`;

                return (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {log.createdAt.toLocaleString()}
                    </TableCell>
                    <TableCell className="truncate">
                      <span className="text-sm font-medium">{actorLabel}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[11px]">
                          {log.action}
                        </Badge>
                        {log.metadata ? <Badge variant="outline">metadata</Badge> : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{entity}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Credenza>
                        <CredenzaTrigger
                          render={<Button size="sm" variant="outline" disabled={!log.metadata} />}
                        >
                          View
                        </CredenzaTrigger>
                        <CredenzaContent className="max-w-2xl">
                          <CredenzaHeader>
                            <CredenzaTitle>Audit metadata</CredenzaTitle>
                          </CredenzaHeader>
                          <CredenzaBody>
                            <pre className="max-h-[60vh] overflow-auto rounded-lg bg-muted p-3 text-xs">
                              {safePrettyJson(log.metadata || "")}
                            </pre>
                          </CredenzaBody>
                        </CredenzaContent>
                      </Credenza>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  );
}
