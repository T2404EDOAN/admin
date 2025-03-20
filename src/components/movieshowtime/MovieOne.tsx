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
import { Select as AntSelect, Space, DatePicker, Pagination, Image } from "antd";
import dayjs from "dayjs";

interface Showtime {
  id?: number;
  startTime: string;
  endTime: string;
  roomId: number;
  price: number;
}

// Update Movie interface to only use genre IDs
interface Movie {
  id: number;
  title: string;
  originalTitle?: string | null;
  trailerUrl?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  duration: number;
  description?: string | null;
  shortDescription?: string | null;
  director?: string | null;
  cast?: string | null;
  productionCompany?: string | null;
  productionCountry?: string | null;
  releaseDate: string;
  endDate?: string | null;
  ageRating: "P" | "C13" | "C16" | "C18"; // Changed to match enum values
  language?: string | null;
  subtitles?: string | null;
  rating: number;
  ratingCount: number;
  status: "COMING_SOON" | "NOW_SHOWING" | "ENDED"; // Update to match backend enum
  genres: { id: number; name: string }[]; // Change back to array of objects
  showtimes: Showtime[];
}

// Add this interface near the top with other interfaces
interface Genre {
  id: number;
  name: string;
}

// Add validation interface near other interfaces
interface ValidationErrors {
  title?: string;
  duration?: string;
  releaseDate?: string;
  genres?: string;
  productionCountry?: string;
  ageRating?: string;
  status?: string;
}

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
  // Update initial movie state with all default values
  const initialMovieState: Partial<Movie> = {
    status: "COMING_SOON",
    ageRating: "P",
    genres: [],
    productionCountry: "",
    title: "",
    duration: 0,
    releaseDate: "",
    description: "",
    cast: "",
    director: "",
    trailerUrl: "",
    posterUrl: "",
  };

  const [newMovie, setNewMovie] = useState<Partial<Movie>>(initialMovieState);
  const [newGenre, setNewGenre] = useState({ name: "" });
  const [newCategory, setNewCategory] = useState<
    Omit<MovieCategory, "id" | "created_at" | "updated_at">
  >({
    name: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Add new state for image preview
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  // Modify the state to store file instead of base64
  const [posterFile, setPosterFile] = useState<File | null>(null);

  // Update image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      // Create temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      setPosterPreview(previewUrl);
      setNewMovie({
        ...newMovie,
        posterUrl: previewUrl
      });
    }
  };

  // Update age rating options to match backend enum descriptions
  const ageRatingOptions = [
    { value: "P", label: "P - Phim dành cho mọi lứa tuổi" },
    { value: "C13", label: "C13 - Cấm khán giả dưới 13 tuổi" },
    { value: "C16", label: "C16 - Cấm khán giả dưới 16 tuổi" },
    { value: "C18", label: "C18 - Cấm khán giả dưới 18 tuổi" },
  ];

  // Update status options to match backend enum
  const statusOptions = [
    { value: "COMING_SOON", label: "Sắp chiếu" },
    { value: "NOW_SHOWING", label: "Đang chiếu" },
    { value: "ENDED", label: "Đã kết thúc" },
  ];

  const countryOptions = [
    { value: "US", label: "Mỹ" },
    { value: "KR", label: "Hàn Quốc" },
    { value: "JP", label: "Nhật Bản" },
    { value: "VN", label: "Việt Nam" },
    { value: "GB", label: "Anh" },
  ];

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8085/api/movies/all?pageNo=${pagination.current - 1}&pageSize=${pagination.pageSize}&sortBy=title&sortDir=asc`
      );
      
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data.content || []);
      setPagination(prev => ({
        ...prev,
        total: data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Update fetchMovieDetails function
  const fetchMovieDetails = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8085/api/movies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch movie details');
      const data = await response.json();
      
      // Cập nhật form với dữ liệu và chuyển đổi định dạng
      setNewMovie({
        ...data,
        genres: data.genres.map((g: any) => ({
          id: g.id,
          name: g.name
        })),
        releaseDate: data.releaseDate ? dayjs(data.releaseDate).format('YYYY-MM-DD') : '',
        endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '',
      });

      // If there's a poster URL, set it for preview
      if (data.posterUrl) {
        setPosterPreview(data.posterUrl);
      }
      
      setIsEditing(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [pagination.current, pagination.pageSize]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!newMovie.title?.trim()) {
      newErrors.title = 'Tên phim là bắt buộc';
    }

    if (!newMovie.duration || newMovie.duration <= 0) {
      newErrors.duration = 'Thời lượng phải lớn hơn 0';
    }

    if (!newMovie.releaseDate) {
      newErrors.releaseDate = 'Ngày khởi chiếu là bắt buộc';
    }

    if (!newMovie.genres || newMovie.genres.length === 0) {
      newErrors.genres = 'Phải chọn ít nhất một thể loại';
    }

    if (!newMovie.productionCountry) {
      newErrors.productionCountry = 'Quốc gia sản xuất là bắt buộc';
    }

    if (!newMovie.ageRating) {
      newErrors.ageRating = 'Giới hạn độ tuổi là bắt buộc';
    }

    if (!newMovie.status) {
      newErrors.status = 'Trạng thái là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add resetForm function
  const resetForm = () => {
    setNewMovie(initialMovieState);
    setPosterPreview(null);
    setPosterFile(null);
    setErrors({});
    setActiveTab(0);
    // Cleanup any object URLs
    if (newMovie.posterUrl && newMovie.posterUrl.startsWith('blob:')) {
      URL.revokeObjectURL(newMovie.posterUrl);
    }
  };

  // Update modal close handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setIsEditing(false);
  };

  // Update handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare movie data
    const movieData = {
      ...newMovie,
      posterUrl: null, // Remove posterUrl from JSON
      genres: newMovie.genres?.map(g => ({ id: g.id })),
      genreIds: newMovie.genres?.map(g => g.id)
    };

    // Create form data
    const formData = new FormData();
    
    // Convert movie data to Blob with proper Content-Type
    const movieBlob = new Blob([JSON.stringify(movieData)], {
      type: 'application/json'
    });
    formData.append('movie', movieBlob);

    // Add poster file if exists
    if (posterFile) {
      formData.append('posterFile', posterFile, posterFile.name);
    }

    const url = isEditing 
      ? `http://localhost:8085/api/movies/${newMovie.id}`
      : 'http://localhost:8085/api/movies/create';
      
    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Cleanup
      if (posterPreview && posterPreview.startsWith('blob:')) {
        URL.revokeObjectURL(posterPreview);
      }
      handleCloseModal();
      await fetchMovies();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8085/api/genres/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGenre)
      });

      if (!response.ok) throw new Error('Failed to create genre');
      
      // Refresh genres list
      await fetchGenres();
      setIsGenreModalOpen(false);
      setNewGenre({ name: '' });
    } catch (error) {
      console.error('Error creating genre:', error);
    }
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
  const [genreOptions, setGenreOptions] = useState<Array<{value: number, label: string}>>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // Add this function to fetch genres
  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:8085/api/genres');
      if (!response.ok) throw new Error('Failed to fetch genres');
      const data: Genre[] = await response.json();
      setGenreOptions(data.map(genre => ({
        value: genre.id,
        label: genre.name
      })));
      setGenres(data); // Add this line
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Add useEffect to fetch genres when component mounts
  useEffect(() => {
    fetchGenres();
  }, []);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize
    }));
  };

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

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {/* Fixed width columns */}
                  <TableCell
                    isHeader
                    className="w-16 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 z-20"
                  >
                    STT
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-24 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Poster
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-64 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[64px] bg-white dark:bg-gray-800 z-20"
                  >
                    Tên phim
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 sticky left-[320px] bg-white dark:bg-gray-800 z-20"
                  >
                    Thể loại
                  </TableCell>
                  {/* Fixed width for common columns */}
                  <TableCell
                    isHeader
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Thời lượng
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Quốc gia
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Đạo diễn
                  </TableCell>
                  {/* Flexible width for content-heavy columns */}
                  <TableCell
                    isHeader
                    className="min-w-[200px] max-w-[300px] px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Diễn viên
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-48 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Độ tuổi
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-40 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Ngày chiếu
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-32 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-24 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                      <TableCell className="px-4 py-3">
                        <Image
                          width={80}
                          src={movie.posterUrl || 'https://placehold.co/80x120?text=No+Image'}
                          alt={movie.title}
                          fallback="https://placehold.co/80x120?text=Error"
                        />
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90 sticky left-[64px] bg-white dark:bg-gray-800 z-10">
                        {movie.title}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 sticky left-[320px] bg-white dark:bg-gray-800 z-10">
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
                        <div className="truncate max-w-[300px]" title={movie.cast || "Chưa cập nhật"}>
                          {movie.cast || "Chưa cập nhật"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color="primary">
                          {ageRatingOptions.find(opt => opt.value === movie.ageRating)?.label || movie.ageRating}
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
                              ? "secondary"
                              : "danger"
                          }
                        >
                          {statusOptions.find(opt => opt.value === movie.status)?.label || movie.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchMovieDetails(movie.id)}
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
      </div>

      <div className="p-4 flex justify-end border-t border-gray-200">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total, range) => `${range[0]}-${range[1]} trên ${total} phim`}
          onChange={handlePaginationChange}
          onShowSizeChange={handlePaginationChange}
          showSizeChanger
          defaultPageSize={10}
          pageSizeOptions={['10', '20', '50']}
        />
      </div>

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}  // Update this line
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              {isEditing ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
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
                          onChange={(e) => {
                            setNewMovie({ ...newMovie, title: e.target.value });
                            setErrors({ ...errors, title: undefined });
                          }}
                        />
                        {errors.title && (
                          <span className="text-red-500 text-sm mt-1">{errors.title}</span>
                        )}
                      </div>
                      <div>
                        <Label>Thể loại*</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <AntSelect
                              mode="multiple"
                              style={{ width: "100%", height: "40px" }}
                              dropdownStyle={{ minWidth: "200px" }}
                              className={`rounded-lg border ${errors.genres ? 'border-red-500' : 'border-gray-300'}`}
                              placeholder="Chọn thể loại"
                              value={newMovie.genres?.map(g => g.id)}
                              onChange={(values: number[]) => {
                                setNewMovie({
                                  ...newMovie,
                                  genres: values.map(id => ({
                                    id,
                                    name: genreOptions.find(g => g.value === id)?.label || ''
                                  }))
                                });
                                setErrors({ ...errors, genres: undefined });
                              }}
                              options={genreOptions}
                            />
                            {errors.genres && (
                              <span className="text-red-500 text-sm mt-1">{errors.genres}</span>
                            )}
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
                          onChange={(e) => {
                            setNewMovie({
                              ...newMovie,
                              duration: parseInt(e.target.value),
                            });
                            setErrors({ ...errors, duration: undefined });
                          }}
                        />
                        {errors.duration && (
                          <span className="text-red-500 text-sm mt-1">{errors.duration}</span>
                        )}
                      </div>
                      <div>
                        <Label>Quốc gia*</Label>
                        <AntSelect
                          showSearch
                          style={{ width: "100%", height: "40px" }}
                          value={newMovie.productionCountry}
                          onChange={(value) => {
                            setNewMovie({ ...newMovie, productionCountry: value });
                            setErrors({ ...errors, productionCountry: undefined });
                          }}
                          placeholder="Chọn quốc gia"
                          optionFilterProp="label"
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={countryOptions}
                        />
                        {errors.productionCountry && (
                          <span className="text-red-500 text-sm mt-1">{errors.productionCountry}</span>
                        )}
                      </div>
                      <div>
                        <Label>Giới hạn độ tuổi*</Label>
                        <AntSelect
                          showSearch
                          style={{ width: "100%", height: "40px" }}
                          value={newMovie.ageRating}
                          onChange={(value) => {
                            setNewMovie({
                              ...newMovie,
                              ageRating: value as Movie["ageRating"],
                            });
                            setErrors({ ...errors, ageRating: undefined });
                          }}
                          placeholder="Chọn giới hạn độ tuổi"
                          optionFilterProp="label"
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={ageRatingOptions}
                        />
                        {errors.ageRating && (
                          <span className="text-red-500 text-sm mt-1">{errors.ageRating}</span>
                        )}
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <AntSelect
                          showSearch
                          style={{ width: "100%", height: "40px" }}
                          value={newMovie.status}
                          onChange={(value) => {
                            setNewMovie({
                              ...newMovie,
                              status: value as Movie["status"],
                            });
                            setErrors({ ...errors, status: undefined });
                          }}
                          placeholder="Chọn trạng thái"
                          optionFilterProp="label"
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          options={statusOptions}
                        />
                        {errors.status && (
                          <span className="text-red-500 text-sm mt-1">{errors.status}</span>
                        )}
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
                          onChange={(date, dateString) => {
                            setNewMovie({
                              ...newMovie,
                              releaseDate: dateString,
                            });
                            setErrors({ ...errors, releaseDate: undefined });
                          }}
                        />
                        {errors.releaseDate && (
                          <span className="text-red-500 text-sm mt-1">{errors.releaseDate}</span>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="endDate">Ngày kết thúc</Label>
                        <DatePicker
                          style={{ width: "100%", height: "40px" }}
                          format="YYYY-MM-DD"
                          placeholder="Chọn ngày kết thúc"
                          value={
                            newMovie.endDate
                              ? dayjs(newMovie.endDate)
                              : null
                          }
                          onChange={(date, dateString) =>
                            setNewMovie({
                              ...newMovie,
                              endDate: dateString,
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
                        <div className="space-y-4">
                          <div className="flex gap-2">
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
                              placeholder="Nhập URL hình ảnh hoặc tải lên"
                            />
                            <label className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer inline-flex items-center">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                              <PlusIcon className="w-5 h-5" />
                            </label>
                          </div>
                          
                          {/* Image Preview */}
                          {(posterPreview || newMovie.posterUrl) && (
                            <div className="relative w-[200px] h-[300px] border rounded-lg overflow-hidden">
                              <Image
                                src={posterPreview || newMovie.posterUrl || ''}
                                alt="Movie poster preview"
                                className="object-cover"
                                width={200}
                                height={300}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPosterPreview(null);
                                  setNewMovie({
                                    ...newMovie,
                                    posterUrl: '',
                                  });
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}  // Update this line
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
          <Dialog.Panel className="mx-auto max-w-md w-full rounded-lg bg-white p-6 dark:bg-gray-800">
            <Dialog.Title className="text-lg font-medium mb-4">
              Thêm thể loại phim
            </Dialog.Title>

            {/* Genre List */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Danh sách thể loại hiện tại:</h3>
              <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                {genres.map((genre) => (
                  <div key={genre.id} className="px-3 py-2 text-sm flex items-center justify-between">
                    <span>{genre.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Genre Form */}
            <form onSubmit={handleGenreSubmit} className="space-y-4">
              <div>
                <Label htmlFor="genreName">Tên thể loại mới*</Label>
                <Input
                  type="text"
                  id="genreName"
                  required
                  maxLength={50}
                  placeholder="Nhập tên thể loại"
                  value={newGenre.name}
                  onChange={(e) =>
                    setNewGenre({ ...newGenre, name: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
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
