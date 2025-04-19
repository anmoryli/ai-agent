package com.anmory.aiagent.mapper;

import com.anmory.aiagent.model.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.Date;
import java.util.List;

/**
 * @author Anmory/李梦杰
 * @description TODO
 * @date 2025-04-10 上午11:23
 */

@Mapper
public interface UserMapper {
    @Select("select * from user_info")
    List<User> getAllUsers();

    @Update("update user_info set user_name = #{userName} where user_id = #{userId}")
    int updateUserName(int userId, String userName);

    @Update("update user_info set password = #{password} where user_id = #{userId}")
    int updatePassword(int userId, String password);

    @Update("update user_info set email = #{email} where user_id = #{userId}")
    int updateEmail(int userId, String email);

    @Select("select YEAR(curdate() - year(birth)) as age from user_info where user_id = #{userId}")
    int getAge(int userId);

    @Select("select * from user_info where user_id = #{userId}")
    User getUserById(int userId);

    @Select("select * from user_info where user_name = #{userName}")
    User getUserByName(String userName);

    @Insert("insert into user_info (user_name, password, birth, sex, email) values (#{userName}, #{password}, #{birth}, #{sex}, #{email})")
    int insertUser(String userName, String password, Date birth, int sex, String email);
}
