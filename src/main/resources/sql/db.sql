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
    is_chose int default 0,
    own_by enum('user', 'agent','null') default 'null',
    create_time datetime default now(),
    update_time datetime on update now(),
    foreign key (user_id) references user_info(user_id)
);

drop table if exists sessions;
create table sessions(
                         session_id int auto_increment primary key not null ,
                         user_id int not null ,
                         title varchar(200),
                         create_time datetime default now(),
                         update_time datetime on update now(),
                         foreign key (user_id) references user_info(user_id)
);

# 剧本表
drop table if exists scripts;
CREATE TABLE IF NOT EXISTS scripts (
                                       script_id INT AUTO_INCREMENT NOT NULL,
                                       session_id INT NOT NULL,
                                       script_name VARCHAR(200) UNIQUE,
                                       script_content TEXT,
                                       result TEXT NOT NULL,
                                       create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                       PRIMARY KEY (script_id),
                                       UNIQUE (script_id, session_id),
                                       FOREIGN KEY (session_id) REFERENCES sessions(session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

drop table if exists session_agents;
create table session_agents(
    session_id int not null ,
    agent_id int not null ,
    joined_time datetime default now(),
    primary key (session_id, agent_id),
    foreign key (session_id) references sessions(session_id),
    foreign key (agent_id) references agents(agent_id)
);

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

drop table if exists message_single;
create table if not exists message_single(
    message_id int not null primary key auto_increment,
    sender_id int not null,
    receiver_id int not null,
    message text not null,
    create_time datetime default now(),
    update_time datetime on update now()
);

# 插入前判断发送者ID是否存在
create trigger validate_sender_id_before_insert
    before insert on messages
    for each row
    begin
        if new.sender_type = 'user' and not exists (select 1 from user_info where user_id = new.sender_id) then
            signal sqlstate '45000' set message_text = '没有这个用户/智能体';
        elseif new.sender_type = 'agent' and not exists (select 1 from agents where agent_id = new.sender_id) then
            signal sqlstate '45000' set message_text = '没有这个用户/智能体';
        end if;
    end;

# 更新前判断发送者ID是否存在
create trigger validate_sender_id_before_update
    before update on messages
    for each row
    begin
        if new.sender_type = 'user' and not exists (select 1 from user_info where user_id = new.sender_id) then
            signal sqlstate '45000' set message_text = '没有这个用户/智能体';
        elseif new.sender_type = 'agent' and not exists (select 1 from agents where agent_id = new.sender_id) then
            signal sqlstate '45000' set message_text = '没有这个用户/智能体';
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


-- 插入会话
INSERT INTO sessions (user_id, title) VALUES
    (1, '午夜庄园谋杀案');

-- 插入代理（角色）
INSERT INTO agents (user_id, agent_name, agent_role, description, own_by) VALUES
                                                                              (1, '艾伦·格雷', '私家侦探', '冷静、观察力敏锐，擅长分析线索。', 'user'),
                                                                              (1, '玛丽·温莎', '贵族夫人', '优雅但心机深重，对庄园遗产虎视眈眈。', 'user'),
                                                                              (1, '詹姆斯·布莱克', '退役军官', '与庄园主人有旧怨，最近争吵频繁。', 'user'),
                                                                              (1, '莉莉·摩根', '庄园女仆', '行为神秘，似乎知道庄园主人的秘密。', 'user');

-- 插入剧本
INSERT INTO scripts (session_id, script_name, script_content, result) VALUES
    (1, '午夜庄园谋杀案',
     '1925年5月15日晚，庄园主人亨利·卡特在书房被发现死亡，胸口插着一把匕首。宾客们被困在庄园，暴风雨切断了对外联系。玩家需通过线索和对话找出真凶。',
     '真凶是詹姆斯·布莱克。他因多年前与亨利的商业纠纷怀恨在心，趁晚宴后潜入书房，用匕首杀害了亨利。动机是报复和掩盖亨利即将公开的丑闻。');

-- 插入线索
INSERT INTO clues (script_id, clue_name, clue_content, is_locked, unlock_condition) VALUES
                                                                                        (1, '染血的匕首', '书房地板上的匕首，刀柄上有“J.B.”的刻字。', 0, NULL),
                                                                                        (1, '詹姆斯的争吵记录', '管家证词，詹姆斯在晚宴前与亨利激烈争吵，提到“旧账”。', 1, '玩家需在会话中提及“争吵”或“管家”。'),
                                                                                        (1, '詹姆斯的日记', '詹姆斯房间的日记，记录了他对亨利的仇恨和计划。', 1, '玩家需在会话中提及“詹姆斯房间”或“日记”。');

-- 插入会话中的代理
INSERT INTO session_agents (session_id, agent_id) VALUES
                                                      (1, 1), -- 艾伦·格雷
                                                      (1, 2), -- 玛丽·温莎
                                                      (1, 3), -- 詹姆斯·布莱克
                                                      (1, 4); -- 莉莉·摩根

-- 插入消息（模拟对话）
INSERT INTO messages (session_id, sender_type, sender_id, message) VALUES
                                                                       (1, 'user', 1, '谁最后见过亨利？'),
                                                                       (1, 'agent', 1, '我看到詹姆斯在晚宴后走向书房。'),
                                                                       (1, 'agent', 4, '我什么也没看到！'),
                                                                       (1, 'user', 1, '詹姆斯的房间有什么可疑的东西吗？'),
                                                                       (1, 'agent', 1, '我找到了一本日记，里面提到他对亨利的仇恨。');

-- 插入推理
INSERT INTO deductions (session_id, deduction_name, deduction_content, is_final) VALUES
    (1, '最终结论', '詹姆斯是凶手，证据包括匕首刻字、争吵记录和日记。', 1);