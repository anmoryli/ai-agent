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

drop table if exists sessions;
create table sessions(
    session_id int auto_increment primary key not null ,
    user_id int not null ,
    title varchar(200),
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (user_id) references user_info(user_id)
);

insert into sessions(user_id, title) values
    (1, 'Session1'),
    (1, 'Session2'),
    (2, 'Session3'),
    (2, 'Session4');

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
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (session_id) references sessions(session_id)
);

# 根据时间进行分区查询
ALTER TABLE messages PARTITION BY RANGE (YEAR(create_time)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026)
    );

insert into messages(session_id, sender_type, sender_id, message) values
    (1, 'user', 1, 'Hello, Agent1!'),
    (1, 'agent', 1, 'Hi, User1! How can I help you?'),
    (1, 'user', 1, 'Can you show me how to use this system?'),
    (1, 'agent', 1, 'Of course, User1! Here are some instructions.'),
    (2, 'user', 2, 'Hello, Agent2!');

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