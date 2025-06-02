using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace server.Migrations
{
    /// <inheritdoc />
    public partial class NewMigrationsUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tbStudentCourseInfoScheduleExam",
                columns: table => new
                {
                    CourseInfoId = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ScheduledDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tbStudentCourseInfoScheduleExam", x => x.CourseInfoId);
                    table.ForeignKey(
                        name: "FK_tbStudentCourseInfoScheduleExam_tbStudentCourseInfo_CourseIn~",
                        column: x => x.CourseInfoId,
                        principalTable: "tbStudentCourseInfo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_tbStudentCourseInfoScheduleExam_CourseInfoId",
                table: "tbStudentCourseInfoScheduleExam",
                column: "CourseInfoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "tbStudentCourseInfoScheduleExam");
        }
    }
}
