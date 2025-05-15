package com.anmory.aiagent.controller;

import com.anmory.aiagent.model.Deductions;
import com.anmory.aiagent.service.DeductionsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-15 下午10:56
 */

@Slf4j
@RestController
@RequestMapping("/deductions")
public class DeductionsController {
    @Autowired
    DeductionsService deductionsService;

    @RequestMapping("/addDeduction")
    public int addDeduction(int sessionId, String deductionName, String deductionContent, int isFinal) {
        return deductionsService.insertDeductions(sessionId, deductionName, deductionContent, isFinal);
    }

    @RequestMapping("/getDeductionsBySessionId")
    public List<Deductions> getDeductionsBySessionId(int sessionId) {
        return deductionsService.getDeductionsBySessionId(sessionId);
    }
}
