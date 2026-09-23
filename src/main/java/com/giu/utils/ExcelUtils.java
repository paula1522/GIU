package com.giu.utils;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;

public class ExcelUtils {

    private ExcelUtils() {
    }

    public static <T> List<T> leerExcel(
            InputStream inputStream,
            Function<Row, T> mapper) {

        List<T> registros = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row != null) {
                    registros.add(mapper.apply(row));
                }
            }

        } catch (Exception e) {
            throw new RuntimeException(
                    "Error procesando el archivo Excel", e);
        }

        return registros;
    }

    public static String obtenerTexto(Cell cell) {

        if (cell == null) {
            return null;
        }

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf(cell.getNumericCellValue());
        }

        return null;
    }

    public static Long obtenerLong(Cell cell) {

        if (cell == null) {
            return null;
        }

        if (cell.getCellType() == CellType.NUMERIC) {
            return (long) cell.getNumericCellValue();
        }

        String valor = obtenerTexto(cell);

        if (valor == null || valor.isEmpty()) {
            return null;
        }

        try {
            return Long.valueOf(valor);
        } catch (NumberFormatException e) {
            throw new RuntimeException(
                    "El valor debe ser un número válido: " + valor);
        }
    }

    public static LocalDateTime obtenerFecha(Cell cell) {

        if (cell == null) {
            return null;
        }


        if (cell.getCellType() == CellType.NUMERIC
                && DateUtil.isCellDateFormatted(cell)) {

            return cell.getLocalDateTimeCellValue();
        }


        String valor = obtenerTexto(cell);

        if (valor == null || valor.isEmpty()) {
            return null;
        }

        String[] formatos = {
                "dd/MM/yyyy HH:mm:ss",
                "dd/MM/yyyy HH:mm",
                "dd/MM/yyyy",
                "yyyy-MM-dd HH:mm:ss",
                "yyyy-MM-dd HH:mm",
                "yyyy-MM-dd"
        };

        for (String formato : formatos) {

            try {
                DateTimeFormatter formatter =
                        DateTimeFormatter.ofPattern(formato);

                if (formato.contains("HH")) {
                    return LocalDateTime.parse(valor, formatter);
                }

                return LocalDate.parse(valor, formatter).atStartOfDay();

            } catch (DateTimeParseException e) {
            }
        }

        throw new RuntimeException(
                "Formato de fecha inválido: " + valor);
    }
}