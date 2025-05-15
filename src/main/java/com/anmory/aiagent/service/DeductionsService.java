package com.anmory.aiagent.service;

import com.anmory.aiagent.mapper.DeductionsMapper;
import com.anmory.aiagent.model.Deductions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author Anmory
 * @description TODO
 * @date 2025-05-15 下午10:53
 */

@Service
public class DeductionsService {
    @Autowired
    DeductionsMapper deductionsMapper;

    public int insertDeductions(int sessionId, String deductionName, String deductionContent, int isFinal) {
        return deductionsMapper.insertDeductions(sessionId, deductionName, deductionContent, isFinal);
    }

    public List<Deductions> getDeductionsBySessionId(int sessionId) {
        return deductionsMapper.getDeductionsBySessionId(sessionId);
    }
}
