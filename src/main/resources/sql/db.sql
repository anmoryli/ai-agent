drop database if exists `ai-agent`;
create database `ai-agent`;
use `ai-agent`;
drop table if exists user_info;
create table user_info(
    user_id int auto_increment primary key not null ,
    user_name varchar(20) not null ,
    password varchar(100) not null ,
    birth datetime not null ,
    sex int not null ,
    email varchar(100),
    create_time datetime default now(),
    update_time datetime on update now()
);

insert into user_info(user_name, password, birth, sex, email) values
    ('anmory', 'lmjnb666', '2005-6-11', 1, 'anmory@qq.com'),
    ('user1', 'user1', '2004-2-13', 0, 'user1@example.com');

drop table if exists agents;
create table agents(
    agent_id int auto_increment primary key not null ,
    user_id int not null ,
    agent_name varchar(20) not null ,
    agent_role text,
    description text,
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (user_id) references user_info(user_id)
);

insert into agents(user_id, agent_name, agent_role, description) values
    (1, 'Agent1', 'Role1', 'Description1'),
    (1, 'Agent2', 'Role2', 'Description2'),
    (2, 'Agent3', 'Role3', 'Description3'),
    (2, 'Agent4', 'Role4', 'Description4');

# 剧本表
drop table if exists scripts;
create table if not exists scripts(
                                      script_id int auto_increment primary key not null ,
                                      script_name varchar(200) unique,
                                      script_content text,
                                      result text not null ,
                                      create_time datetime default now(),
                                      update_time datetime on update now()
);

insert into scripts(script_name, script_content, result) values
    ('Script1', 'This is the first script.', 'Result1'),
    ('Script2', 'This is the second script.', 'Result2'),
    ('Script3', 'This is the third script.', 'Result3'),
    ('Script4', 'This is the fourth script.', 'Result4');

drop table if exists sessions;
create table sessions(
    session_id int auto_increment primary key not null ,
    user_id int not null ,
    script_id int,
    title varchar(200),
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (user_id) references user_info(user_id),
    foreign key (script_id) references scripts(script_id)
);

insert into sessions(user_id, script_id, title) values
    (1, 1, 'Session1'),
    (1, 2, 'Session2'),
    (2, 3, 'Session3'),
    (2, 4, 'Session4');

drop table if exists session_agents;
create table session_agents(
    session_id int not null ,
    agent_id int not null ,
    joined_time datetime default now(),
    primary key (session_id, agent_id),
    foreign key (session_id) references sessions(session_id),
    foreign key (agent_id) references agents(agent_id)
);

insert into session_agents(session_id, agent_id, joined_time) values
    (1, 1, now()),
    (1, 2, now()),
    (2, 3, now()),
    (2, 4, now());

drop table if exists messages;
create table messages(
    message_id int auto_increment primary key not null ,
    session_id int not null ,
    sender_type enum('user', 'agent') not null ,
    sender_id int not null ,
    message text,
    img_path varchar(200),
    file_path varchar(200),
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (session_id) references sessions(session_id)
);

insert into messages(session_id, sender_type, sender_id, message) values
    (1, 'user', 1, 'Hello, Agent1!'),
    (1, 'agent', 1, 'Hi, User1! How can I help you?'),
    (1, 'user', 1, 'Can you show me how to use this system?'),
    (1, 'agent', 1, 'Of course, User1! Here are some instructions.'),
    (2, 'user', 2, 'Hello, Agent2!');

drop table if exists clues;
create table if not exists clues(
    clue_id int auto_increment primary key not null ,
    script_id int not null ,
    clue_name varchar(200),
    clue_content text,
    is_locked int default 0,
    unlock_condition text,
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (script_id) references scripts(script_id)
);

insert into clues(script_id, clue_name, clue_content) values
    (1, 'Clue1', 'This is the first clue.'),
    (1, 'Clue2', 'This is the second clue.'),
    (2, 'Clue3', 'This is the third clue.'),
    (2, 'Clue4', 'This is the fourth clue.');

drop table if exists deductions;
create table if not exists deductions(
    deduction_id int auto_increment primary key not null ,
    session_id int not null ,
    deduction_name varchar(200),
    deduction_content text,
    is_final int default 0,
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (session_id) references sessions(session_id)
);

insert into deductions(session_id, deduction_name, deduction_content) values
    (1, 'Deduction1', 'This is the first deduction.'),
    (1, 'Deduction2', 'This is the second deduction.'),
    (2, 'Deduction3', 'This is the third deduction.'),
    (2, 'Deduction4', 'This is the fourth deduction.');

# 插入前判断发送者ID是否存在
create trigger validate_sender_id_before_insert
    before insert on messages
    for each row
    begin
        if new.sender_type = 'user' and not exists (select 1 from user_info where user_id = new.sender_id) then
            signal sqlstate '45000' set message_text = 'Invalid sender_id for user_type';
        elseif new.sender_type = 'agent' and not exists (select 1 from agents where agent_id = new.sender_id) then
            signal sqlstate '45000' set message_text = 'Invalid sender_id for agent_type';
        end if;
    end;

# 更新前判断发送者ID是否存在
create trigger validate_sender_id_before_update
    before update on messages
    for each row
    begin
        if new.sender_type = 'user' and not exists (select 1 from user_info where user_id = new.sender_id) then
            signal sqlstate '45000' set message_text = 'Invalid sender_id for user_type';
        elseif new.sender_type = 'agent' and not exists (select 1 from agents where agent_id = new.sender_id) then
            signal sqlstate '45000' set message_text = 'Invalid sender_id for agent_type';
        end if;
    end;

# 判断智能体是否已经加入过对话
create trigger before_insert_session_agents
    before insert on session_agents
    for each row
    begin
        if exists(
            select 1 from session_agents where session_id = new.session_id and agent_id = new.agent_id
        ) then
            signal sqlstate '45000'
            set message_text = '主键重复，该会话下的智能体已经加入过对话了';
        end if;
    end;