package diegodiaz.report_taback.controller;

import diegodiaz.report_taback.dto.ReportPeriodDTO;
import diegodiaz.report_taback.dto.ReportRankingDTO;
import diegodiaz.report_taback.dto.ReportRequestDTO;
import diegodiaz.report_taback.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin_client_role')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/period")
    public ResponseEntity<List<ReportPeriodDTO>> getPeriodReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ReportRequestDTO request = new ReportRequestDTO();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        return ResponseEntity.ok(reportService.getPeriodReport(request));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<ReportRankingDTO>> getReportRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        ReportRequestDTO request = new ReportRequestDTO();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        return ResponseEntity.ok(reportService.getRankingRanking(request));
    }
}