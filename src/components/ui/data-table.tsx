import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T) => React.ReactNode;
  searchable?: boolean; // Nuevo campo para indicar si esta columna debe incluirse en la búsqueda
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  searchKey?: keyof T | string;
  pagination?: boolean;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  searchKey,
  pagination = true,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      
      const filtered = data.filter((item) => {
        // Si searchKey está definido, buscar solo en esa propiedad o propiedades
        if (searchKey) {
          if (typeof searchKey === 'string') {
            // Verificar si searchKey contiene múltiples campos separados por comas
            if (searchKey.includes(',')) {
              // Múltiples campos para buscar
              const searchFields = searchKey.split(',');
              
              // Retornar true si cualquiera de los campos contiene el texto de búsqueda
              return searchFields.some(field => {
                const value = item[field.trim() as keyof T] as unknown;
                return typeof value === 'string' && value.toLowerCase().includes(searchLower);
              });
            } else if (searchKey.includes('.')) {
              // Manejar propiedades anidadas (ruta de acceso con puntos)
              const keys = searchKey.split('.');
              let value: any = item;
              
              for (const key of keys) {
                if (value == null) return false;
                value = value[key];
              }
              
              // Verificar si el valor existe y es un string
              if (typeof value === 'string') {
                return value.toLowerCase().includes(searchLower);
              }
              return false;
            } else {
              // Buscar en un solo campo
              const value = item[searchKey as keyof T] as unknown;
              return typeof value === 'string' && value.toLowerCase().includes(searchLower);
            }
          } else {
            // Método anterior para compatibilidad (cuando searchKey es un keyof T)
            const value = item[searchKey] as unknown;
            return typeof value === 'string' && value.toLowerCase().includes(searchLower);
          }
        }
        
        // Si no hay searchKey, buscar en todas las propiedades directas que sean strings
        for (const key in item) {
          const value = item[key as keyof T] as unknown;
          
          if (typeof value === "string" && value.toLowerCase().includes(searchLower)) {
            return true;
          }
          
          // Buscar en propiedades anidadas (primer nivel)
          if (value !== null && typeof value === "object") {
            for (const nestedKey in value) {
              const nestedValue = value[nestedKey as keyof typeof value] as unknown;
              if (typeof nestedValue === "string" && 
                  nestedValue.toLowerCase().includes(searchLower)) {
                return true;
              }
            }
          }
        }
        return false;
      });
      
      setFilteredData(filtered);
      setCurrentPage(1);
    } else {
      setFilteredData(data);
    }
  }, [data, searchValue, searchKey]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayData = pagination ? filteredData.slice(startIndex, endIndex) : filteredData;

  const getValue = (item: T, accessorKey: keyof T | ((item: T) => React.ReactNode)): React.ReactNode => {
    if (typeof accessorKey === "function") {
      return accessorKey(item);
    }
    
    // Convertir el valor a un ReactNode seguro
    const value = item[accessorKey];
    
    // Si es un objeto o array, convertir a string JSON
    if (value !== null && typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Convertir primitivos a string si no son undefined o null
    return value === undefined || value === null ? '' : String(value);
  };

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="search"
            className="block w-full pl-10 pr-3 py-2"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, idx) => (
                <TableHead key={idx}>
                  {typeof column.header === "string" ? column.header : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, idx) => (
                  <TableRow key={idx}>
                    {columns.map((_, colIdx) => (
                      <TableCell key={colIdx}>
                        <div className="h-5 w-full bg-gray-200 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
            ) : displayData.length > 0 ? (
              displayData.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, colIdx) => (
                    <TableCell key={colIdx}>
                      {column.cell ? column.cell(item) : getValue(item, column.accessorKey)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-gray-500">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <nav className="flex items-center justify-between" aria-label="Pagination">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
