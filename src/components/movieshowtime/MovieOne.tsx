import { Tab } from "@headlessui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { Select as AntSelect, Space, DatePicker } from "antd";
import dayjs from "dayjs";
import axios from "axios";
interface Showtime {
  id?: number;
  startTime: string;
  endTime: string;
  roomId: number;
  price: number;
}

interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  trailerUrl?: string;
  posterUrl?: string;
  backdropUrl?: string;
  duration: number;
  description?: string;
  shortDescription?: string;
  categoryId?: number;
  director?: string;
  cast?: string;
  productionCompany?: string;
  productionCountry?: string;
  releaseDate: string;
  endDate?: string;
  ageRating: "P" | "C13" | "C16" | "C18";
  language?: string;
  subtitles?: string;
  rating: number;
  ratingCount: number;
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED";
  genres?: string[]; // Change from genre?: string
  country?: string;
  synopsis?: string;
  showtimes?: Showtime[];
}

const movieData: Movie[] = [
  {
    id: 1,
    title: "Avengers: Endgame",
    originalTitle: "Avengers: Endgame",
    duration: 181,
    description: "After Thanos...",
    posterUrl: "https://example.com/poster1.jpg",
    ageRating: "C13",
    status: "ENDED",
    releaseDate: "2023-01-01",
    endDate: "2023-02-01",
    rating: 4.5,
    ratingCount: 1000,
  },
  {
    id: 2,
    title: "Spider-Man: No Way Home",
    originalTitle: "Spider-Man: No Way Home",
    duration: 148,
    description: "Peter Parker's secret...",
    posterUrl: "https://example.com/poster2.jpg",
    ageRating: "C13",
    status: "NOW_SHOWING",
    releaseDate: "2023-06-01",
    endDate: "2023-07-01",
    rating: 4.8,
    ratingCount: 2000,
  },
];

const formTabs = [
  { name: "Thông tin cơ bản", icon: "info" },
  { name: "Chi tiết sản xuất", icon: "film" },
  { name: "Nội dung & Media", icon: "description" },
];

interface MovieCategory {
  id?: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export default function MovieOne() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({
    status: "COMING_SOON",
    ageRating: "P",
  });
  const [newGenre, setNewGenre] = useState({ name: "" });
  const [newCategory, setNewCategory] = useState<
    Omit<MovieCategory, "id" | "created_at" | "updated_at">
  >({
    name: "",
    description: "",
  });

  const ageRatingOptions = [
    { value: "P", label: "P - Phổ biến" },
    { value: "C13", label: "C13" },
    { value: "C16", label: "C16" },
    { value: "C18", label: "C18" },
  ];

  const statusOptions = [
    { value: "COMING_SOON", label: "Sắp chiếu" },
    { value: "NOW_SHOWING", label: "Đang chiếu" },
    { value: "ENDED", label: "Đã kết thúc" },
  ];

  const genreOptions = [
    { value: "ACTION", label: "Hành động" },
    { value: "COMEDY", label: "Hài" },
    { value: "DRAMA", label: "Chính kịch" },
    { value: "HORROR", label: "Kinh dị" },
    { value: "ROMANCE", label: "Tình cảm" },
    { value: "SCIFI", label: "Khoa học viễn tưởng" },
  ];

  const countryOptions = [
    { value: "US", label: "Mỹ" },
    { value: "KR", label: "Hàn Quốc" },
    { value: "JP", label: "Nhật Bản" },
    { value: "VN", label: "Việt Nam" },
    { value: "GB", label: "Anh" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit:", newMovie);
    setIsModalOpen(false);
  };

  const handleGenreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit new genre:", newGenre);
    setIsGenreModalOpen(false);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit new category:", newCategory);
    setIsGenreModalOpen(false);
    setNewCategory({ name: "", description: "" });
  };

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://skystar.io.vn/api/movies");

        // Lưu toàn bộ dữ liệu vào state
        setMovies(response.data.content);
        console.log(response.data.content);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="p-4 flex items-center justify-end gap-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="w-64">
          <Input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Thêm phim mới</span>
        </button>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1400px]">
          {" "}
          {/* Increased minimum width */}
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* Fixed Columns */}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20"
                >
                  STT
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[50px] bg-white dark:bg-gray-800 z-20"
                >
                  Tên phim
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-20"
                >
                  Thể loại
                </TableCell>
                {/* Scrollable Columns */}
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Thời lượng
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Quốc gia
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Đạo diễn
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Diễn viên
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Độ tuổi
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ngày chiếu
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : movies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-4">
                    Không có dữ liệu phim
                  </TableCell>
                </TableRow>
              ) : (
                movies.map((movie, index) => (
                  <TableRow key={movie.id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-10">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[50px] bg-white dark:bg-gray-800 z-10">
                      {movie.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[250px] bg-white dark:bg-gray-800 z-10">
                      {movie.genres.map((genre) => genre.name).join(", ")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.duration} phút
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.productionCountry}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.director || "Chưa cập nhật"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {movie.cast || "Chưa cập nhật"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <Badge size="sm" color="primary">
                        {movie.ageRating}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {dayjs(movie.releaseDate).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        size="sm"
                        color={
                          movie.status === "NOW_SHOWING"
                            ? "success"
                            : movie.status === "COMING_SOON"
                            ? "warning"
                            : "error"
                        }
                      >
                        {movie.status === "NOW_SHOWING"
                          ? "Đang chiếu"
                          : movie.status === "COMING_SOON"
                          ? "Sắp chiếu"
                          : "Đã kết thúc"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => console.log("Edit:", movie.id)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => console.log("Delete:", movie.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm phim mới
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                <Tab.List className="flex space-x-2 rounded-xl bg-gray-100 p-1">
                  {formTabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                         ${
                           selected
                             ? "bg-white text-blue-600 shadow"
                             : "text-gray-600 hover:text-gray-800"
                         }`
                      }
                    >
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>

                <Tab.Panels className="mt-4">
                  {/* Basic Info Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Tên phim*</Label>
                        <Input
                          type="text"
                          id="title"
                          required
                          value={newMovie.title || ""}
                          onChange={(e) =>
                            setNewMovie({ ...newMovie, title: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Thể loại*</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <AntSelect
                              mode="multiple"
                              style={{ width: "100%", height: "40px" }}
                              dropdownStyle={{ minWidth: "200px" }}
                              className="rounded-lg border border-gray-300"
                              placeholder="Chọn thể loại"
                              value={newMovie.genres}
                              onChange={(values) =>
                                setNewMovie({ ...newMovie, genres: values })
                              }
                              options={genreOptions}
                              optionRender={(option) => (
                                <Space>
                                  {option.data.label}
                                  <span className="text-gray-500 text-sm">
                                    {option.data.desc}
                                  </span>
                                </Space>
                              )}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsGenreModalOpen(true)}
                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          >
                            <PlusIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="duration">Thời lượng (phút)*</Label>
                        <Input
                          type="number"
                          id="duration"
                          required
                          value={newMovie.duration || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              duration: parseInt(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Quốc gia*</Label>
                        <Select
                          options={countryOptions}
                          value={newMovie.country}
                          onChange={(value) =>
                            setNewMovie({ ...newMovie, country: value })
                          }
                          placeholder="Chọn quốc gia"
                        />
                      </div>
                      <div>
                        <Label>Giới hạn độ tuổi*</Label>
                        <Select
                          options={ageRatingOptions}
                          value={newMovie.ageRating}
                          onChange={(value) =>
                            setNewMovie({
                              ...newMovie,
                              ageRating: value as Movie["ageRating"],
                            })
                          }
                          placeholder="Chọn giới hạn độ tuổi"
                        />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Select
                          options={statusOptions}
                          value={newMovie.status}
                          onChange={(value) =>
                            setNewMovie({
                              ...newMovie,
                              status: value as Movie["status"],
                            })
                          }
                          placeholder="Chọn trạng thái"
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Production Details Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="director">Đạo diễn</Label>
                        <Input
                          type="text"
                          id="director"
                          value={newMovie.director || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              director: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cast">Diễn viên</Label>
                        <Input
                          type="text"
                          id="cast"
                          value={newMovie.cast || ""}
                          onChange={(e) =>
                            setNewMovie({ ...newMovie, cast: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="releaseDate">Ngày khởi chiếu*</Label>
                        <DatePicker
                          style={{ width: "100%", height: "40px" }}
                          format="YYYY-MM-DD"
                          placeholder="Chọn ngày khởi chiếu"
                          value={
                            newMovie.releaseDate
                              ? dayjs(newMovie.releaseDate)
                              : null
                          }
                          onChange={(date, dateString) =>
                            setNewMovie({
                              ...newMovie,
                              releaseDate: dateString,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="trailerUrl">Đường dẫn Trailer</Label>
                        <Input
                          type="url"
                          id="trailerUrl"
                          value={newMovie.trailerUrl || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              trailerUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Content & Media Panel */}
                  <Tab.Panel className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="description">Mô tả</Label>
                        <textarea
                          id="description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
                          rows={3}
                          placeholder="Nhập mô tả phim"
                          value={newMovie.description || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="synopsis">Nội dung phim</Label>
                        <textarea
                          id="synopsis"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
                          rows={4}
                          placeholder="Nhập nội dung phim"
                          value={newMovie.synopsis || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              synopsis: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="posterUrl">Đường dẫn Poster</Label>
                        <Input
                          type="url"
                          id="posterUrl"
                          value={newMovie.posterUrl || ""}
                          onChange={(e) =>
                            setNewMovie({
                              ...newMovie,
                              posterUrl: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Add Genre Modal */}
      <Dialog
        open={isGenreModalOpen}
        onClose={() => setIsGenreModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm thể loại phim
            </Dialog.Title>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Tên thể loại*</Label>
                <Input
                  type="text"
                  id="categoryName"
                  required
                  maxLength={50}
                  placeholder="Nhập tên thể loại"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="categoryDescription">Mô tả</Label>
                <textarea
                  id="categoryDescription"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 transition-all duration-200"
                  rows={4}
                  placeholder="Nhập mô tả cho thể loại"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGenreModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thêm
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
