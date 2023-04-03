DROP PROCEDURE IF EXISTS editBlog;
DELIMITER //
CREATE PROCEDURE editBlog
(
    idIn        INT,
    titleIn     VARCHAR(50),
    contentIn   longtext
)
BEGIN
    UPDATE blogs 
    SET title=titleIn, content=contentIn
    WHERE blogId=idIn;
END //
DELIMITER ;
