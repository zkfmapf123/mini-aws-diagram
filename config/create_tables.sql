CREATE TABLE IF NOT EXISTS aws_resources (
    id VARCHAR(255) PRIMARY KEY AUTO_INCREMENT,
    resource_type VARCHAR(100) NOT NULL,
    name VARCHAR(255),
    region VARCHAR(50),
    account_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_relationships (
    source_id VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (source_id, target_id, relationship_type),
    FOREIGN KEY (source_id) REFERENCES aws_resources(id),
    FOREIGN KEY (target_id) REFERENCES aws_resources(id)
);

CREATE TABLE IF NOT EXISTS traces (
    trace_id VARCHAR(64) NOT NULL,
    span_id VARCHAR(32) NOT NULL,
    parent_span_id VARCHAR(32),
    resource_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    status_code INT,
    status_message VARCHAR(255),
    attributes JSON,
    events JSON,
    PRIMARY KEY (trace_id, span_id),
    FOREIGN KEY (resource_id) REFERENCES aws_resources(id)
); 