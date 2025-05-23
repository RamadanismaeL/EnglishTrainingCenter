/*
*@auhtor: Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class StudentCourseFeeMap : IEntityTypeConfiguration<StudentCourseFeeModel>
    {
        public void Configure(EntityTypeBuilder<StudentCourseFeeModel> builder)
        {
            builder.Property(s => s.Order)
                .HasColumnName("Order")
                .HasColumnType("bigint unsigned")
                .ValueGeneratedOnAdd()
                .IsRequired();
            builder.HasKey(s => s.Order);

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("varchar(50)")
                .IsRequired();
            builder.HasIndex(s => s.Id)
                .IsUnique();

            builder.Property(s => s.PriceTotal)
                .HasColumnName("PriceTotal")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            builder.Property(s => s.PricePaid)
                .HasColumnName("PricePaid")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            builder.Property(s => s.PriceDue)
                .HasColumnName("PriceDue")
                .HasColumnType("decimal(10,2)")
                .HasComputedColumnSql("PriceTotal - PricePaid", stored: true)
                .IsRequired();

            builder.Property(s => s.Status)
                .HasColumnName("Status")
                .HasColumnType("varchar(50)")
                .HasComputedColumnSql("CASE WHEN PriceTotal - PricePaid = 0 THEN 'Paid' ELSE 'Not Paid' END", stored: false)
                .IsRequired();

            builder.Property(s => s.DateUpdate)
                .HasColumnName("DateUpdate")
                .HasColumnType("datetime");

            builder.Property(s => s.StudentId)
                .HasColumnName("StudentId")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.HasOne(sc => sc.StudentData)
                .WithOne(sd => sd.StudentCourseFee)
                .HasPrincipalKey<StudentDataModel>(sd => sd.Id)
                .HasForeignKey<StudentCourseFeeModel>(sc => sc.StudentId);

            builder.HasMany(sc => sc.Payments)
                .WithOne(p => p.CourseFeeData)
                .HasPrincipalKey(sc => sc.Id)
                .HasForeignKey(p => p.CourseFeeId)
                .OnDelete(DeleteBehavior.Cascade);           
        }
    }
}