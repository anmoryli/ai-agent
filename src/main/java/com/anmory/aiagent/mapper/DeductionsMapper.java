package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.Deductions;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-05-15 下午10:43
 */

@Mapper
public interface DeductionsMapper {
    @Insert("insert into `ai-agent`.deductions (session_id, deduction_name, deduction_content, is_final) values " +
            "(#{sessionId}, #{deductionName}, #{deductionContent}, #{isFinal})")
    int insertDeductions(int sessionId, String deductionName, String deductionContent, int isFinal);

    @Select("select * from `ai-agent`.deductions where session_id = #{sessionId}")
    List<Deductions> getDeductionsBySessionId(int sessionId);

    @Delete("delete from `ai-agent`.deductions where session_id = #{sessionId}")
    int deleteDeductions(int sessionId);
}
