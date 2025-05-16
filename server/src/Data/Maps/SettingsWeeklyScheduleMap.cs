/*
*@ author Ramadan Ismael
*/

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using server.src.Models;

namespace server.src.Data.Maps
{
    public class SettingsWeeklyScheduleMap : IEntityTypeConfiguration<SettingsWeeklyScheduleModel>
    {
        public void Configure(EntityTypeBuilder<SettingsWeeklyScheduleModel> builder)
        {
            builder.ToTable("tbSettingsWeeklySchedule");

            builder.Property(s => s.Id)
                .HasColumnName("Id")
                .HasColumnType("int unsigned")
                .ValueGeneratedOnAdd()
                .IsRequired();
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Monday)
                .HasColumnName("Monday")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.Tuesday)
                .HasColumnName("Tuesday")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.Wednesday)
                .HasColumnName("Wednesday")
                .HasColumnType("varchar(50)")
                .IsRequired();

            builder.Property(s => s.Thursday)
                .HasColumnName("Thursday")
                .HasColumnType("varchar(50)")
                .IsRequired();
        }
    }
}