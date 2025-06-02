/*
*@author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentCourseInfoScheduleExamMap : IEntityTypeConfiguration<StudentCourseInfoScheduleExamModel>
    {
        public void Configure(EntityTypeBuilder<StudentCourseInfoScheduleExamModel> builder)
        {
            builder.ToTable("tbStudentCourseInfoScheduleExam");

            builder.Property(s => s.CourseInfoId)
                .HasColumnName("CourseInfoId")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasIndex(s => s.CourseInfoId)
                .IsUnique();

            builder.Property(s => s.ScheduledDate)
                .HasColumnName("ScheduledDate")
                .HasColumnType("datetime");

            builder.Property(s => s.CourseInfoId)
                .HasColumnName("CourseInfoId")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.HasOne(s => s.CourseInfoData)
                .WithOne(s => s.CourseInfoScheduleExamData)
                .HasPrincipalKey<StudentCourseInfoModel>(s => s.Id)
                .HasForeignKey<StudentCourseInfoScheduleExamModel>(s => s.CourseInfoId)
                .OnDelete(DeleteBehavior.Cascade);  // Se o StudentDataModel for deletado, o CourseInfo associado também será automaticamente removida. (Delete em cascata - Remove os dependentes);
        }
    }
}