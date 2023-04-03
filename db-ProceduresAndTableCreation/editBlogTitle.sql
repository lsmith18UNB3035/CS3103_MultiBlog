DELIMITER //
CREATE PROCEDURE editBlogTitle
(
    idIn        INT,
    titleIn     VARCHAR(50)
)
BEGIN
    UPDATE blogs SET title=titleIn WHERE blogId=idIn; 
END //
DELIMITER ;
